import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
import './index.scss';

// Third Party Imports ...

const mapStateToProps = (state, props) => {
  return ({
    params: state.router.route.params,
    organizationsFetched: state.organizations.status.fetched,
    organizationsByName: Selectors.organizationsByName(state),
    accountsByName: Selectors.accountsByName(state),
    fetchingError: state.opsPayments.status.fetchingError,
    fetchingPayments: state.opsPayments.status.fetching,
    form: _try(() => state.forms['Components.routes.opsSearch'].default),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    setQueryParams: (data) => {
      dispatch(Store.router.setSearchQueryParams(data));
    },
    sync: (params) => {
      dispatch(Store.opsPayments.sync(params));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
    ...bindActionCreators(Store.forms, dispatch),
  });
};

class components_routes_opsSearch extends Component {
  state = {
    name: 'Components.routes.opsSearch',
    tableKey: 'opsPayments',
    searchError: '',
  }

  componentDidMount() {
    const { initialize, validate, initialFormData } = this.props;

    initialize(this.state.name, 'default', this.defaultValues);
    if (this.props.params && Object.keys(this.props.params).length) this.props.sync(this.props.params);
  }
  componentDidUpdate(prevProps) {
    if (this.props.organizationsFetched !== prevProps.organizationsFetched && (Object.keys(this.props.params).length)) {
      const validValues = Object.keys(this.props.params).filter(paramField => availableQueries[paramField]);
      validValues.forEach(param => this.standardFormAction('change', param, this.props.params[param]));

      const requiredFieldHasValue = Object.keys(requiredFields).some(requiredField => validValues.includes(requiredField));
      if (!requiredFieldHasValue) {
        this.props.setQueryParams({});
        return this.props.resetForm(this.state.name, 'default', this.defaultValues);
      }

    }
  }




  defaultValues = {
    cardNumberLastFour: '',
    amount: '',
    account: '',
    status: 'Any',
    organization: '',
    method: 'Any',
    vendorName: '',
  };

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, 'default', field, value);
    } else {
      this.props[action](this.state.name, 'default', field);
    }
  };

  handleSubmit = () => {
    const params = sanitizeQueryParams(this.props.form._values);
    this.props.setQueryParams(params);
    this.props.sync(params);
  }

  handleReset = () => {
    this.props.setQueryParams({});
    this.props.resetForm(this.state.name, 'default', this.defaultValues);
  }

  render() {
    const selectedOrgId = _try(() => this.props.organizationsByName[this.props.form._values.organization]);

    const searchInputs = [
      { field: 'cardNumberLastFour', fieldType: 'number', name: 'Card Last 4' },
      { field: 'amount', fieldType: 'number', name: 'Amount' },
      { field: 'vendorName', fieldType: 'string', name: 'Vendor' },
      { field: 'method', fieldType: 'options', name: 'Method', options: 'Any,vCard,pCard,check,ACH', fieldPlaceholder: 'Any', needsField: true },
      { field: 'status', fieldType: 'options', name: 'Status', options: 'Any,Scheduled,Needs Approval,Pending...,Processing...,Verifying...,Funding...,Tracking...,Complete,Cancelled', fieldPlaceholder: 'Any', needsField: true },
      { field: 'organization', fieldType: 'options', name: 'Organization', options: Object.keys(this.props.organizationsByName).join(',') },
      { field: 'account', fieldType: 'options', name: 'Account', options: _try(() => Object.keys(this.props.accountsByName[selectedOrgId]).join(','), '') },
    ];

    return (
      <Fragment>
        <form className="floating-labels" onSubmit={console.log}>
          {/* <form className="floating-labels" onSubmit={(e) => { e.preventDefault(); console.log('asdf'); this.handleSubmit(); }}> */}
          <div className="row">
            {
              this.props.form && searchInputs.map((input) => {
                let disabled = this.props.updating;
                if (input.needsField) {
                  const formValues = this.props && this.props.form && this.props.form._values || {};
                  const requiredFieldHasValue = Object.keys(requiredFields).some(requiredField => !!formValues[requiredField]);
                  if (!requiredFieldHasValue) {
                    disabled = true;
                    if (formValues[input.field] !== 'Any') this.standardFormAction('change', input.field, 'Any');
                  }
                }
                return (
                  <Components.forms.components.dynamicfield
                    className="col-12 col-md-3"
                    field={input}
                    fieldKey={input.field}
                    form={this.props.form}
                    formAction={this.standardFormAction}
                    disabled={disabled}
                    fieldPlaceholder={input.fieldPlaceholder || null}
                    enforce={input.fieldType === 'number' ? /^[0-9]*$/ : null}
                  />
                );
              })
            }
            <div className="col-12 col-md-3 mb-2 mb-md-0">
              <Components.button
                className="btn btn-success me-2"
                buttonText="Search"
                onClick={this.handleSubmit}
                ariaLabel="Search"
                updating={this.props.fetchingPayments}
                disabled={this.props.form && !Object.keys(sanitizeQueryParams(this.props.form._values)).length}
              />
              <Components.button
                className="btn btn-secondary"
                buttonText="Clear"
                onClick={this.handleReset}
                ariaLabel="Clear Search Inputs"
              />
            </div>
          </div>
        </form>

        <Components.tables.opsPayments
          tableKey={this.state.tableKey}
        />

        {this.props.fetchingError &&
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            Error: {this.props.fetchingError}
          </div>
        }
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_opsSearch);

// Internal Helper Functions ...
const sanitizeQueryParams = (formValues = {}) => {
  return Object.keys(formValues).reduce((acc, curr) => {
    if (!formValues[curr] || formValues[curr] === 'Any') return acc;
    acc[curr] = formValues[curr];
    return acc;
  }, {});
};

const availableQueries = {
  amount: true,
  method: true,
  cardNumberLastFour: true,
  status: true,
  vendorName: true,
};

const requiredFields = {
  amount: true,
  cardNumberLastFour: true,
  vendorName: true,
};
