import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';



const mapStateToProps = (state, props) => ({
  forms: state.forms,
  status: state.account.reportTemplates.status,
  organizations: state.organizations.data.items,
  organizationsByName: Selectors.organizationsByName(state),
  accounts: state.accounts.data.items,
  accountsByName: Selectors.accountsByName(state),
  transactionDetailStatus: state.transactionDetails.status,
});

const mapDispatchToProps = { ...Store.forms };

class components_forms_reportsearch extends Component {

  state = {
    name: 'Components.forms.reportsearch',
    key: 'default',
    tableData: [],
    csvData: [],
    dropdownIsOpen: false,
    actions: ['Schedule', 'Export CSV', 'Customize'],
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      startDate,
      endDate,
      search,
    } = this.props;

    const { name, key } = this.state;

    initialize(name, key, {
      startDate: startDate
        ? new Date(new Date(startDate).setHours(0, 0, 0, 0))
        : new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setHours(0, 0, 0, 0)),
      endDate: endDate
        ? new Date(new Date(endDate).setHours(0, 0, 0, 0))
        : new Date(new Date().setHours(0, 0, 0, 0)),
      search: search || '',
    });

    validate(name, key, this.validate);
  }

  componentWillReceiveProps(nextProps) {
    const { name, key } = this.state;
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(name, key, this.props.forms[name][key]._values);
    }

    this.setState({
      form: nextProps.forms[name] && nextProps.forms[name][nextProps.formKey || 'default'],
      key: 'default',
    });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
      if (field === 'search') this.props.onSearch(value);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  validate = (fields) => {
    const errors = {};
    if (fields.startDate > fields.endDate) {
      errors.startDate = 'Invalid dates.';
      errors.endDate = 'Invalid dates.';
    }
    return errors;
  };

  toggle = () => {
    this.setState((prevState) => {
      return { dropdownIsOpen: !prevState.dropdownIsOpen };
    });
  }

  render() {
    const { form } = this.state;
    if (!form) return null;

    const creating = this.props.status.creating;

    return (
      <div className="components_forms_reportsearch floating-labels">
        <div className="row">
          <div className={'col-6'}>
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="search"
              action={this.standardFormAction}
              label="Search"
              disabled={this.props.disabled}
              hideError={!form.search.touched}
              required={false}
            />
          </div>
          <div className="col-md-3">
            <Components.forms.components.daypicker
              form={form}
              type="number"
              field="startDate"
              action={this.standardFormAction}
              label="From"
              dateRange={{ max: form.endDate.value }}
              disabled={creating}
            />
          </div>
          <div className="col-md-3">
            <Components.forms.components.daypicker
              form={form}
              type="number"
              field="endDate"
              action={this.standardFormAction}
              label="To"
              dateRange={{ min: form.startDate.value }}
              disabled={creating}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_reportsearch);


