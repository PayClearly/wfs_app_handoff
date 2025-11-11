import {
  connect, Component,
} from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Components from 'components';
import Constants from '../../../constants';

import './index.scss';

const mapStateToProps = (state) => ({
  forms: state.forms,
  types: state.validations.data.item,
});

const mapDispatchToProps = { ...Store.forms };

class components_forms_globalVendorProcedureACH extends Component {
  state = {
    name: 'Components.forms.globalVendorProcedureACH',
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      initialData = {},
    } = this.props;
    const formKey = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    initialize(this.state.name, formKey, {
      achNotes: initialData.achNotes || '',
      achFirstName: initialData.achFirstName || '',
      achLastName: initialData.achLastName || '',
      achEmail: initialData.achEmail || '',
      achRoutingNumber: initialData.achRoutingNumber || '',
      achAccountNumber: initialData.achAccountNumber || '',
      achProvider: initialData.achProvider || '',
      achMaxTransactionAmount: initialData.achMaxTransactionAmount || '',
      active: Object.prototype.hasOwnProperty.call(initialData, 'active') ? !!initialData.active : true,
      achNotifyOnCreation: Object.prototype.hasOwnProperty.call(initialData, 'achNotifyOnCreation') ? !!initialData.achNotifyOnCreation : false,
      achNotifyOnCreationEmails: initialData.achNotifyOnCreationEmails?.length ? initialData.achNotifyOnCreationEmails.join(',') : '',
      achNotifyOnCompletion: initialData.achNotifyOnCompletion ? !!initialData.achNotifyOnCompletion : false,
      achNotifyOnCompletionEmails: initialData.achNotifyOnCompletionEmails?.length ? initialData.achNotifyOnCompletionEmails.join(',') : '',
      achDeliverySpeed: initialData.achDeliverySpeed || 'next-day',
      achDeliveryMethod: initialData.achDeliveryMethod || 'pushAch',
    });
    validate(this.state.name, formKey, this.validate);
  }

  componentWillReceiveProps(nextProps = {}) {
    const formKey = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, formKey, this.props.forms[this.state.name][formKey]._values);
    }

    this.setState({
      form: nextProps.forms[this.state.name] && nextProps.forms[this.state.name][formKey],
      formKey,
    });
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.formKey);
  }

  validate = (values) => {
    const errors = {};
    if (!values.achProvider) {
      errors.achProvider = 'Select an ACH provider';
    }

    if (values.achDeliveryMethod === 'pullAch') {
      if (values.achMaxTransactionAmount < 0 || values.achMaxTransactionAmount >= Constants.ACH_MAX_TRANSACTION_AMOUNT) {
        errors.achMaxTransactionAmount = `Amount must be between $0 and $${Constants.ACH_MAX_TRANSACTION_AMOUNT}`;
      }
    }

    if (values.achDeliveryMethod === 'pushAch') {
      if (!values.achFirstName) {
        errors.achFirstName = 'Account holder first name is required';
      }

      if (!values.achLastName) {
        errors.achLastName = 'Account holder last name is required';
      }

      if (!values.achEmail) {
        errors.achEmail = 'Account email is required';
      }

      if (!values.achRoutingNumber) {
        errors.achRoutingNumber = 'Bank routing number is required';
      }

      if (values.achRoutingNumber && values.achRoutingNumber.length !== 9) {
        errors.achRoutingNumber = 'Bank routing number must be 9 characters';
      }

      // Only enforce ACH account number requirement if in create form
      if (!values.achAccountNumber && this.props.forCreate) {
        errors.achAccountNumber = 'Bank account number is required';
      }

      if (values.achAccountNumber && values.achAccountNumber.length < 4) {
        errors.achAccountNumber = 'Bank account number must be 4 characters or more';
      }
    }

    // Notification preference validations
    const achNotifyOnCreationEmails = values.achNotifyOnCreationEmails.split(',');
    if (values.achNotifyOnCreationEmails && achNotifyOnCreationEmails.some((email) => !this.checkType('EmailAddress', email))) {
      errors.achNotifyOnCreationEmails = achNotifyOnCreationEmails.length > 1 ? 'All emails must be valid email addresses' : Utils.typesvalidator.validationErrorMsgs.email;
    }
    if (values.achNotifyOnCreation && !values.achNotifyOnCreationEmails) {
      errors.achNotifyOnCreationEmails = 'Email address required';
    }

    const achNotifyOnCompletionEmails = values.achNotifyOnCompletionEmails.split(',');
    if (values.achNotifyOnCompletionEmails && achNotifyOnCompletionEmails.some((email) => !this.checkType('EmailAddress', email))) {
      errors.achNotifyOnCompletionEmails = achNotifyOnCompletionEmails.length > 1 ? 'All emails must be valid email addresses' : Utils.typesvalidator.validationErrorMsgs.email;
    }
    if (values.achNotifyOnCompletion && !values.achNotifyOnCompletionEmails) {
      errors.achNotifyOnCompletionEmails = 'Email address required';
    }

    return errors;
  };

  checkType = (type, against) => Utils.typesvalidator.validateType(this.props.types, type, against).valid;

  standardFormAction = (action, field, value) => {
    if (action === 'change') {
      this.props[action](this.state.name, this.state.formKey, field, value);
      this.props.validate(this.state.name, this.state.formKey, this.validate);
    } else {
      this.props[action](this.state.name, this.state.formKey, field);
    }
  };

  render() {
    const { form } = this.state;
    if (!form) { return null; }

    return (
      <form className="floating-labels components_forms_globalVendorProcedureACH pt-2">
        <h3 className="mb-3">Payment Settings</h3>
        <div className="row">
          <Components.featureFlagWrapper featureKey="achDeliveryMethod">
            <div className="col-xs-12 col-md-6">
              <Components.forms.components.selectinput
                form={form}
                field="achDeliveryMethod"
                action={this.standardFormAction}
                label="ACH Delivery Method"
                options={ACH_METHOD_OPTIONS}
                placeholder={ACH_METHOD_OPTIONS[form.achDeliveryMethod.value] && ACH_METHOD_OPTIONS[form.achDeliveryMethod.value].display || ''}
                disabled={!form.achDeliveryMethod.value}
                hideError={!form.achDeliveryMethod.touched}
              />
            </div>
          </Components.featureFlagWrapper>
          <div className="col-xs-12 col-md-6">
            <Components.forms.components.selectinput
              form={form}
              field="achProvider"
              action={this.standardFormAction}
              label="ACH Provider"
              options={getAchProviderOptions(form._values?.achDeliveryMethod)}
              placeholder={'Select an ACH provider'}
              required
              disabled={!this.props.forCreate}
              hideError={!form.achProvider.touched}
            />
          </div>
          {form._values?.achDeliveryMethod === 'pushAch'
            && <>
              <div className="col-12 col-md-4">
                <Components.forms.components.textinput
                  form={form}
                  type="text"
                  field="achFirstName"
                  action={this.standardFormAction}
                  label="First Name"
                  disabled={this.props.disabled}
                  hideError={!form.achFirstName.touched}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <Components.forms.components.textinput
                  form={form}
                  type="text"
                  field="achLastName"
                  action={this.standardFormAction}
                  label="Last Name"
                  disabled={this.props.disabled}
                  hideError={!form.achLastName.touched}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <Components.forms.components.textinput
                  form={form}
                  type="text"
                  field="achEmail"
                  action={this.standardFormAction}
                  label="Email Address"
                  disabled={this.props.disabled}
                  hideError={!form.achEmail.touched}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <Components.forms.components.textinput
                  form={form}
                  type="text"
                  field="achRoutingNumber"
                  action={this.standardFormAction}
                  label="Routing Number"
                  disabled={this.props.disabled}
                  hideError={!form.achRoutingNumber.touched}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <Components.forms.components.textinput
                  form={form}
                  type="text"
                  field="achAccountNumber"
                  action={this.standardFormAction}
                  label="Account Number"
                  disabled={this.props.disabled}
                  hideError={!form.achAccountNumber.touched}
                  required={this.props.forCreate}
                />
              </div>
              <div className="col-xs-12 col-md-4">
                <Components.forms.components.selectinput
                  form={form}
                  field="achDeliverySpeed"
                  action={this.standardFormAction}
                  label="ACH Delivery Speed"
                  options={ACH_SPEED_OPTIONS}
                  placeholder={(ACH_SPEED_OPTIONS[form.achDeliverySpeed.value] && ACH_SPEED_OPTIONS[form.achDeliverySpeed.value].display) || ''}
                  disabled={!form.achDeliverySpeed.value}
                  hideError={!form.achDeliverySpeed.touched}
                />
              </div>
            </>}
        </div>
        {form._values?.achDeliveryMethod === 'pullAch' && (
          <>
            <h4 className="mb-3">Additional Options</h4>
            <div className="row">
              <div className="col-12">
                <Components.forms.components.maskedinput
                  form={form}
                  type="string"
                  useNumberMask
                  field="achMaxTransactionAmount"
                  action={this.standardFormAction}
                  label="Max Per-Transaction Amount"
                  hideError={!form.achMaxTransactionAmount.touched}
                  disabled={this.props.disabled}
                />
              </div>
            </div>
          </>
        )}
        <h3>Notification Settings</h3>
        <div className="row">
          <div className="col-12 col-md-3">
            <Components.forms.components.checkbox
              form={form}
              field="achNotifyOnCreation"
              action={this.standardFormAction}
              label="Notify On Payment Creation"
              disabled={this.props.disabled}
              hideError={!form.achNotifyOnCreation.touched}
            />
          </div>
          <div className="col-12 col-md-9">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="achNotifyOnCreationEmails"
              action={this.standardFormAction}
              label="Creation Notification Delivery Emails"
              detailedInformation="Comma separate multiple emails, i.e. x,y,z"
              disabled={this.props.disabled || !form._values?.achNotifyOnCreation}
              hideError={!form.achNotifyOnCreationEmails?.touched}
              required={form._values?.achNotifyOnCreation}
            />
          </div>
          <div className="col-12 col-md-3">
            <Components.forms.components.checkbox
              form={form}
              field="achNotifyOnCompletion"
              action={this.standardFormAction}
              label="Notify On Payment Completion"
              disabled={this.props.disabled}
              hideError={!form.achNotifyOnCompletion.touched}
            />
          </div>
          <div className="col-12 col-md-9">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="achNotifyOnCompletionEmails"
              action={this.standardFormAction}
              label="Completion Notification Delivery Emails"
              detailedInformation="Comma separate multiple emails, i.e. x,y,z"
              disabled={this.props.disabled || !form._values?.achNotifyOnCompletion}
              hideError={!form.achNotifyOnCompletionEmails.touched}
              required={form._values?.achNotifyOnCompletion}
            />
          </div>
        </div>
        <h3 className="mb-3">Miscellaneous Settings</h3>
        <div className="row">
          <div className="col-12 col-md-2">
            <Components.forms.components.switch
              form={form}
              field="active"
              action={this.standardFormAction}
              label="Active"
              disabled={this.props.disabled}
            />
          </div>
          <div className="col-12 col-md-10">
            <Components.forms.components.textArea
              form={form}
              type="text"
              field="achNotes"
              action={this.standardFormAction}
              label="Notes"
              disabled={this.props.disabled}
              hideError={!form.achNotes.touched}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_globalVendorProcedureACH);

// Internal Helper Functions ...
const ACH_SPEED_OPTIONS = {
  'same-day': {
    display: 'Same Day',
  },
  'next-day': {
    display: 'Next Day',
  },
  standard: {
    display: 'Standard',
  },
};

const ACH_PROVIDERS = {
  DWOLLA: {
    display: 'Dwolla',
  },
  GALILEO: {
    display: 'Galileo',
  },
};

const ACH_METHOD_OPTIONS = {
  pushAch: {
    display: 'Push ACH',
  },
  pullAch: {
    display: 'Pull ACH (echeck)',
  },
};

function getAchProviderOptions(achDeliveryMethod) {
  if (achDeliveryMethod === 'pullAch') {
    return { GALILEO: { display: 'Galileo' } };
  }
  return ACH_PROVIDERS;
}

