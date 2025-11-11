import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    types: state.validations.data.item,
    users: state.users.data.items,
    userId: state.user.profile.data.item._id,
  });
};

const mapDispatchToProps = { ...Store.forms };

class components_forms_invoicedetails extends Component {

  state = {
    name: 'Components.forms.invoicedetails',
  }

  componentDidMount() {
    const { initialize, validate } = this.props;
    const formKey = this.props.formKey;
    const initialFormData = this.props.initialFormData || {};

    const initialData = {
      vendorName: initialFormData.vendorName || '',
      invoiceNumber: initialFormData.invoiceNumber || '',
      invoiceDate: (initialFormData.invoiceDate && new Date(initialFormData.invoiceDate)),
      amount: numeral(initialFormData.amount).format('0.00') || '',
      currency: initialFormData.currency || 'usd',
      paymentTerms: initialFormData.paymentTerms || '',
      dueDate: (initialFormData.dueDate && new Date(initialFormData.dueDate)),
      memo: initialFormData.memo || '',
      chartOfAccount: initialFormData.chartOfAccount || '',
      approverIds: _try(() => initialFormData.approverIds.length) ? initialFormData.approverIds : [],
      approvers: '',
    };
    initialize(this.state.name, formKey, initialData);
    validate(this.state.name, formKey, this.validate);
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][nextProps.formKey || 'default'],
      key: nextProps.formKey || 'default',
    });
  }
  componentWillUnmount() {
  }

  onTypeAheadChange = (options) => {
    const data = options.length ? options.map(option => option._id) : [];
    this.props.change(this.state.name, this.state.key, 'approverIds', data);
    this.props.validate(this.state.name, this.state.key, this.validate);
  };

  validate = (fields) => {
    const { types } = this.props;
    const errors = {};

    if (!fields.vendorName) {
      errors.vendorName = 'Vendor name is required';
    }
    if (!fields.invoiceNumber) {
      errors.invoiceNumber = 'Invoice Number is required';
    }
    if (!fields.amount) {
      errors.amount = 'Amount is required';
    }
    if (!fields.dueDate) {
      errors.dueDate = 'Due Date is required';
    }

    return errors;
  }
  
  standardFormAction = (action, field, value) => {
    
    const fields = (typeof field === 'object') && field || {
      [field]: value,
    };
    
    //   fields.approvers = [];
    // }

    if (action === 'change') {
      this.props[action](this.state.name, this.state.key, fields);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  }

  render() {
    const { form } = this.state;
    if (!form) return null;
    const { creating, users = {}, userId } = this.props;

    return (
      <div className="floating-labels components_forms_invoicedetails">
        <Components.forms.components.accordion
          noBottomMargin
          leftAligned
          initialOpen
          showLabel="Invoice Details"
          hideLabel="Invoice Details"
        >
          <div className="row pt-4">
            <div className="col-12">
              <Components.forms.components.textinput 
                form={form}
                field="vendorName"
                action={this.standardFormAction}
                label="Vendor Name"
                hideError={!form.vendorName.touched}
                disabled={creating}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-6">
              <Components.forms.components.textinput 
                form={form}
                field="invoiceNumber"
                action={this.standardFormAction}
                label="Invoice Number"
                hideError={!form.invoiceNumber.touched}
                disabled={creating}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <Components.forms.components.daypicker
                form={form}
                type="number"
                field="invoiceDate"
                formatDate={_formatDate}
                placeholder="YYYY-MM-DD"
                action={this.standardFormAction}
                label="Invoice Date"
                hideError={!form.invoiceDate.touched}
                disabled={creating}
                UTC
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-6">
              <Components.forms.components.maskedinput 
                form={form}
                maskPlaceholder=""
                field="amount"
                type="string"
                useNumberMask
                action={this.standardFormAction}
                label="Amount"
                hideError={!form.amount.touched}
                disabled={creating}
                required
              />
            </div>
            <div className="col-12 col-md-6">
              <Components.forms.components.selectinput 
                form={form}
                field="currency"
                action={this.standardFormAction}
                label="Currency"
                hideError={!form.currency.touched}
                disabled={creating}
                required
                options={{
                  usd: { display: 'USD' },
                  can: { display: 'CAN' },
                }}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-6">
              <Components.forms.components.textinput 
                form={form}
                field="paymentTerms"
                action={this.standardFormAction}
                label="Payment Terms"
                hideError={!form.paymentTerms.touched}
                disabled={creating}
              />
            </div>
            <div className="col-12 col-md-6">
              <Components.forms.components.daypicker 
                form={form}
                type="number"
                field="dueDate"
                placeholder="YYYY-MM-DD"
                formatDate={_formatDate}
                action={this.standardFormAction}
                label="Due Date"
                hideError={!form.dueDate.touched}
                disabled={creating}
                required
                UTC
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <Components.forms.components.textinput 
                form={form}
                field="memo"
                action={this.standardFormAction}
                label="Payment Memo"
                hideError={!form.memo.touched}
                disabled={creating}
              />
            </div>
          </div>
        </Components.forms.components.accordion>
        <Components.forms.components.accordion
          noBottomMargin
          leftAligned
          showLabel="Expense Details"
          hideLabel="Expense Details"
        >
          <div className="row pt-4">
            <div className="col-12">
              <Components.forms.components.textinput 
                form={form}
                field="chartOfAccount"
                action={this.standardFormAction}
                label="Chart of Account"
                hideError={!form.chartOfAccount.touched}
                disabled={creating}
              />
            </div>
          </div>
          
        </Components.forms.components.accordion>
        <Components.forms.components.accordion
          leftAligned
          showLabel="Approver(s)"
          hideLabel="Approver(s)"
        >
          <div className="row pt-4">
            <div className="col-12">
              <Components.forms.components.typeahead
                form={form}
                field="approvers"
                action={() => {}}
                label="Approver(s)"
                disabled={creating}
                hideError={!form.approvers.touched}
                multiple
                options={_mapApproverOptions(Object.values(users))}
                noItemsText="Not Found"
                floatLabel
                onTypeAheadChange={this.onTypeAheadChange}
                selected={_mapApproverOptions(form.approverIds.value.map(id => this.props.users[id]).filter(user => user))}
              />
            </div>

          </div>
          {
            form.approverIds.value.includes(userId) &&
            <Components.entities.userprofile noProfile />
          }
        </Components.forms.components.accordion>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_invoicedetails);

// Internal Helper Functions ... 
const _mapApproverOptions = (users) => {
  return users.map(({ _id, email, firstName, lastName }) => ({
    _id,
    label: (firstName && lastName) ? `${firstName} ${lastName}` : email,
  }));
};

const _formatDate = (date) => {
  if (!date) return date;
  return `${date.getUTCFullYear()}-${_pad(date.getUTCMonth() + 1)}-${_pad(date.getUTCDate())}`;
};
const _pad = (n) => {
  return (n < 10) ? `0${n}` : n;
};

