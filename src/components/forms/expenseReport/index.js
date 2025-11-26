import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Store from 'store';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
    profile: state.user.profile.data.item,
    userId: _try(() => state.user.profile.data.item._id, ''),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openResourceSelectorModal: () => {
      dispatch(Store.router.openModal('Components.modals.resourceSelector'));
    },
    ...bindActionCreators(Store.forms, dispatch),
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_forms_expenseReport extends Component {
  state = {
    name: 'Components.forms.expenseReport',
  }

  componentDidMount() {
    const { initialize, validate, profile } = this.props;
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    const initialData = this.props.initialData || {};
    let userName;

    if (profile.firstName) {
      userName = profile.firstName;
      if (profile.lastName) userName = `${userName} ${profile.lastName}`;
    } else if (profile.lastName) {
      userName = profile.lastName;
    } else {
      userName = profile.username;
    }

    initialize(this.state.name, key, {
      name: initialData.name || `${Utils.dates.dateToDay(Date.now(), 'expenseReportName')} | ${userName}`,
      expenseIds: initialData.expenseIds || {},
      approver: initialData.approver || '',
    });
    validate(this.state.name, key, this.validate);

    if (_try(() => this.props.parent.formName && this.props.parent.formKey)) {
      this.props.addChild(this.props.parent.formName, this.props.parent.formKey, this.state.name, key);
    }
  }
  componentWillReceiveProps(nextProps = {}) {
    const key = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';
    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][key],
      key,
    });

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }
  }
  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, field, value);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  checkType = (type, against) => {
    return Utils.typesvalidator.validateType(this.props.types, type, against).valid;
  };

  validate = (values) => {
    const errors = {};

    if (!values.name) errors.name = 'Field is required';

    return errors;
  };

  render() {
    const form = this.state.form;
    if (!form) return null;

    return (
      <form className="components_forms_expenseReport floating-labels">
        <div className="row">
          <div className="col-12">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="name"
              action={this.standardFormAction}
              label="Report Name"
              disabled={this.props.disabled}
              hideError={!form.name.touched}
              required
            />
          </div>
          <div className="col-12">
            <Components.forms.components.resourceSelector
              form={form}
              field="expenseIds"
              formName={this.state.name}
              formKey={this.state.key}
              action={this.standardFormAction}
              // required

              pathToData="state.account.expenses.data.items"
              entity={Components.entities.expense}
              resources="Expenses"
              columns={[
                { label: 'Date', dataKey: 'date', sortable: true, cellRenderer: date => Utils.dates.dateToDay(date, 'dateFormatUS') },
                { label: 'Vendor', dataKey: 'vendor', sortable: true, default: 'Unknown' },
                { label: 'Amount', dataKey: 'amount', sortable: true, default: 'Unknown', cellRenderer: amount => Utils.numeral()(amount).format('$0,0.00') },
                { label: 'Source', dataKey: 'source', sortable: true, default: 'Unknown', cellRenderer: source => <Components.badges.expenseSource source={source} /> },
                { label: 'Receipt', dataKey: 'receipt', sortable: false, cellRenderer: receipt => <Components.badges.expenseReceipt receipt={receipt} /> },
                { label: 'Memo', dataKey: 'memo', sortable: true, default: '' },
              ]}
            >
              <Components.tables.expenses
                initialTableStateOverride={{
                  filters: {
                    deleted: { key: 'deleted', type: 'bool', comparator: 'is', value: false },
                    expenseReport: { key: 'reportId', type: 'bool', comparator: 'is', value: false },
                    createdBy: { key: 'createdBy', type: 'string', comparator: 'equals', value: this.props.userId },
                  },
                  sort: {
                    sortKey: 'date',
                    orderIn: 'desc',
                  },
                }}
              />
            </Components.forms.components.resourceSelector>
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_forms_expenseReport);

