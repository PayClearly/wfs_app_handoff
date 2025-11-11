import {
  connect, Component,
} from 'component';

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

class components_forms_globalVendorProcedureVCard extends Component {

  state = {
    name: 'Components.forms.globalVendorProcedureVCard',
    acceptedFiles: [],
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      initialData = {},
    } = this.props;
    const formKey = Object.keys(this.props).includes('formKey') ? this.props.formKey : 'default';

    initialize(this.state.name, formKey, {
      notes: initialData.notes || '',
      vCardMaxPerCardAmount: initialData.vCardMaxPerCardAmount || '',
      vCardRequireUniqueAmounts: initialData.vCardRequireUniqueAmounts || false,
      vCardDeliveryMethod: initialData.vCardDeliveryMethod || 'manual',
      vCardEmails: initialData?.vCardEmails?.length ? initialData.vCardEmails.join(',') : '',
      vCardCCEmails: initialData?.vCardCCEmails?.length ? initialData.vCardCCEmails.join(',') : '',
      vCardFaxNumbers: initialData?.vCardFaxNumbers?.length ? initialData.vCardFaxNumbers.join(',') : '',
      vCardUseFaxTemplate: initialData.vCardUseFaxTemplate || false,
      vCardUseEmailTemplate: initialData.vCardUseEmailTemplate || false,
      vCardNotifyOnCreation: Object.prototype.hasOwnProperty.call(initialData, 'vCardNotifyOnCreation') ? !!initialData.vCardNotifyOnCreation : false,
      vCardNotifyOnCreationEmails: initialData?.vCardNotifyOnCreationEmails?.length ? initialData.vCardNotifyOnCreationEmails.join(',') : '',
      vCardNotifyOnCompletion: Object.prototype.hasOwnProperty.call(initialData, 'vCardNotifyOnCompletion') ? !!initialData.vCardNotifyOnCompletion : false,
      vCardNotifyOnCompletionEmails: initialData?.vCardNotifyOnCompletionEmails?.length ? initialData.vCardNotifyOnCompletionEmails.join(',') : '',
      active: Object.prototype.hasOwnProperty.call(initialData, 'active') ? !!initialData.active : true,
      vCardHideCCBINNumber: initialData.vCardHideCCBINNumber || false,
      bin: initialData.bin || '',
    });

    validate(this.state.name, formKey, this.validate);

    this.props.formDelegate.getFormAttachments = () => ({
      attachments: this.state.acceptedFiles,
    });
    this.setState({
      formKey,
      acceptedFiles: initialData.vCardPaymentForm && [initialData.vCardPaymentForm] || initialData.attachments || [],
    }, () => { this.props.validate(this.state.name, this.state.formKey, this.validate); });

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

  onDrop = (files) => {
    this.setState({
      acceptedFiles: files,
    });
    setTimeout(() => {
      this.props.validate(this.state.name, this.state.formKey, this.validate);
    }, 100);
  };

  validate = (values) => {
    const errors = {};
    if (values.vCardMaxPerCardAmount < 0 || values.vCardMaxPerCardAmount >= Constants.VCARD_MAX_AMOUNT) {
      errors.vCardMaxPerCardAmount = `Amount must be between $0 and $${Constants.VCARD_MAX_AMOUNT}`;
    }

    if (values.vCardDeliveryMethod === 'email') {
      if (!values.vCardEmails) {
        errors.vCardEmails = 'Email address required';
      }
      const emails = values.vCardEmails.split(',');
      if (values.vCardEmails && emails.some((email) => !this.checkType('EmailAddress', email))) {
        errors.vCardEmails = emails.length > 1 ? 'All emails must be valid email addresses' : Utils.typesvalidator.validationErrorMsgs.email;
      }
      const ccEmails = values.vCardCCEmails.split(',');
      if (values.vCardCCEmails && ccEmails.some((email) => !this.checkType('EmailAddress', email))) {
        errors.vCardCCEmails = ccEmails.length > 1 ? 'All emails must be valid email addresses' : Utils.typesvalidator.validationErrorMsgs.email;
      }
      if (emails.some((email) => ccEmails.some((cc) => cc === email))) {
        errors.vCardCCEmails = 'Cannot use duplicate email in CC';
      }
      const hideAttachments = (_try(() => values.vCardDeliveryMethod === 'email') && _try(() => values.vCardUseEmailTemplate));
      if (!hideAttachments && !this.state.acceptedFiles.length) {
        errors.vCardDeliveryMethod = 'An attachment must be included';
      }
    }
    if (values.vCardDeliveryMethod === 'fax') {
      if (!values.vCardFaxNumbers) {
        errors.vCardFaxNumbers = 'Fax number is required';
      }
      const faxes = values.vCardFaxNumbers.split(',');
      if (values.vCardFaxNumbers && faxes.some((fax) => !this.checkType('PhoneNumber', fax))) {
        errors.vCardFaxNumbers = faxes.length > 1 ? 'All fax numbers must be valid phone numbers' : Utils.typesvalidator.validationErrorMsgs.email;
      }
      const hideAttachments = (_try(() => values.vCardDeliveryMethod === 'fax') && _try(() => values.vCardUseFaxTemplate));
      if (!hideAttachments && !this.state.acceptedFiles.length) {
        errors.vCardDeliveryMethod = 'An attachment must be included';
      }
    }
    if (values.vCardDeliveryMethod === 'phone') {
      if (!values.notes.match(/\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*/)) {
        errors.notes = 'You must add a phone number to the notes';
      }
    }
    // Notification preference validations
    const vCardNotifyOnCreationEmails = values.vCardNotifyOnCreationEmails.split(',');
    if (values.vCardNotifyOnCreationEmails && vCardNotifyOnCreationEmails.some((email) => !this.checkType('EmailAddress', email))) {
      errors.vCardNotifyOnCreationEmails = vCardNotifyOnCreationEmails.length > 1 ? 'All emails must be valid email addresses' : Utils.typesvalidator.validationErrorMsgs.email;
    }
    if (values.vCardNotifyOnCreation && !values.vCardNotifyOnCreationEmails) { errors.vCardNotifyOnCreationEmails = 'Email address required'; }

    const vCardNotifyOnCompletionEmails = values.vCardNotifyOnCompletionEmails.split(',');
    if (values.vCardNotifyOnCompletionEmails && vCardNotifyOnCompletionEmails.some((email) => !this.checkType('EmailAddress', email))) {
      errors.vCardNotifyOnCompletionEmails = vCardNotifyOnCompletionEmails.length > 1 ? 'All emails must be valid email addresses' : Utils.typesvalidator.validationErrorMsgs.email;
    }
    if (values.vCardNotifyOnCompletion && !values.vCardNotifyOnCompletionEmails) { errors.vCardNotifyOnCompletionEmails = 'Email address required'; }

    return errors;
  };

  checkType = (type, against) => Utils.typesvalidator.validateType(this.props.types, type, against).valid;

  standardFormAction = (action, field, value) => {
    const fields = {};
    fields[field] = value;

    if (action === 'change') {
      if (field === 'vCardDeliveryMethod') {
        if (value === 'manual') {
          fields.vCardEmails = '';
          fields.vCardCCEmails = '';
          fields.vCardUseEmailTemplate = false;
          fields.vCardFaxNumbers = '';
          fields.vCardUseFaxTemplate = false;
          // fields.vCardFlowId = '';
          this.setState({ acceptedFiles: [] });
        } else if (value === 'email') {
          fields.vCardFaxNumbers = '';
          fields.vCardUseFaxTemplate = false;
          // fields.vCardFlowId = '';
        } else if (value === 'fax') {
          fields.vCardEmails = '';
          fields.vCardCCEmails = '';
          fields.vCardUseEmailTemplate = false;
          // fields.vCardFlowId = '';
        } else if (value === 'phone') {
          fields.vCardEmails = '';
          fields.vCardCCEmails = '';
          fields.vCardFaxNumbers = '';
          fields.vCardUseFaxTemplate = false;
          fields.vCardUseEmailTemplate = false;
          // fields.vCardFlowId = '';
        } else if (value === 'automation' || value === Constants.AUTOMATION_TAIKO) {
          fields.vCardEmails = '';
          fields.vCardCCEmails = '';
          fields.vCardFaxNumbers = '';
          fields.vCardUseFaxTemplate = false;
          fields.vCardUseEmailTemplate = false;
        }
      }

      if (field === 'vCardUseEmailTemplate' || field === 'vCardUseFaxTemplate') {
        if (value === true) {
          this.setState({ acceptedFiles: [] });
        }
      }

      this.props[action](this.state.name, this.state.formKey, fields);
      this.props.validate(this.state.name, this.state.formKey, this.validate);
    } else {
      this.props[action](this.state.name, this.state.formKey, field);
    }
  };

  render() {
    const { form } = this.state;
    if (!form) { return null; }

    const hideAttachments = _try(() => form.vCardDeliveryMethod.value === 'automation' || form.vCardDeliveryMethod.value === Constants.AUTOMATION_TAIKO) || _try(() => form.vCardDeliveryMethod.value === 'manual') || _try(() => form.vCardDeliveryMethod.value === 'phone') || (_try(() => form.vCardDeliveryMethod.value === 'email') && _try(() => form.vCardUseEmailTemplate.value)) || (_try(() => form.vCardDeliveryMethod.value === 'fax') && _try(() => form.vCardUseFaxTemplate.value));
    const hideDropzone = _try(() => this.state.acceptedFiles[0]._createdBy);

    return (
      <form className="floating-labels components_forms_globalVendorProcedureVCard pt-2">
        <h3 className="mb-3">Payment Settings</h3>
        <div className="row">
          <div className={'col-xs-12 col-md-12'}>
            <Components.forms.components.selectinput
              form={form}
              field="vCardDeliveryMethod"
              action={this.standardFormAction}
              label="Virtual Card Delivery Method"
              options={deliveryOptions}
              placeholder={deliveryOptions[form.vCardDeliveryMethod.value].display}
              required
            />
          </div>
        </div>
        {
          form.vCardDeliveryMethod.value === 'email'
          && <div className="row">
            <div className={'col-xs-12 col-md-5'}>
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="vCardEmails"
                action={this.standardFormAction}
                label="Payment Email Addresses"
                detailedInformation="Comma separate multiple emails, i.e. x,y,z"
                required
                hideError={!form.vCardEmails.touched}
              />
            </div>
            <div className={'col-xs-12 col-md-5'}>
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="vCardCCEmails"
                action={this.standardFormAction}
                label="Payment Email CC Addresses"
                detailedInformation="Comma separate multiple emails, i.e. x,y,z"
                hideError={!form.vCardCCEmails.touched}
              />
            </div>
            <div className="col-xs-12 col-md-2">
              <Components.forms.components.switch
                form={form}
                field="vCardUseEmailTemplate"
                action={this.standardFormAction}
                label="Use Email Template"
              />
            </div>
          </div>
        }
        {
          form.vCardDeliveryMethod.value === 'fax'
          && <div className="row">
            <div className={'col-xs-12 col-md-5'}>
              <Components.forms.components.textinput
                form={form}
                type="text"
                field="vCardFaxNumbers"
                action={this.standardFormAction}
                label="Payment Fax Numbers"
                detailedInformation="Comma separate multiple fax numbers, i.e. x,y,z"
                required
                hideError={!form.vCardFaxNumbers.touched}
              />
            </div>
            <div className="col-xs-12 col-md-2">
              <Components.forms.components.switch
                form={form}
                field="vCardUseFaxTemplate"
                action={this.standardFormAction}
                label="Use Fax Template"
              />
            </div>
          </div>
        }
        {
          !hideAttachments
          && <div className="row">
            <div className={'col-12'}>
              {!hideDropzone
                && <Components.dropzone
                  title={' '}
                  accept={'application/pdf'}
                  instructions={'Upload File Below'}
                  onDrop={(files) => this.onDrop(files)}
                  acceptedFiles={this.state.acceptedFiles}
                  required
                />}
              {hideDropzone
                && <Components.attachments
                  attachments={[this.state.acceptedFiles[0]]}
                  cardHeader={'Current Attachment'}
                  handleRemove={() => { this.setState({ acceptedFiles: [] }); }}
                />}
            </div>
          </div>
        }
        <h4 className="mb-3">Additional Options</h4>
        <div className="row">
          <div className="col-12">
            <Components.forms.components.maskedinput
              form={form}
              type="string"
              useNumberMask
              field="vCardMaxPerCardAmount"
              action={this.standardFormAction}
              label="Max Per-Card Amount"
              hideError={!form.vCardMaxPerCardAmount.touched}
            />
          </div>
          <Components.forms.components.checkbox
            form={form}
            field="vCardRequireUniqueAmounts"
            action={this.standardFormAction}
            label="Require each virtual card to have a unique amount if payment is split into multiple cards."
            disabled={!form.vCardMaxPerCardAmount}
          ></Components.forms.components.checkbox>
          <Components.featureFlagWrapper featureKey="galileoPaymentCardBinToggle">
            <div className="col-12">
              <Components.forms.components.selectinput
                form={form}
                field="bin"
                action={this.standardFormAction}
                label="Bin Override (this will override the account level bin settings!)"
                options={binOptions}
                placeholder={binOptions[form?.bin?.value]?.display || 'Select Bin Override'}
                includeResetOption
              />
            </div>
          </Components.featureFlagWrapper>
          <div className="col-12">
            <Components.forms.components.checkbox
              form={form}
              field="vCardHideCCBINNumber"
              action={this.standardFormAction}
              label="Hide Credit Card BIN Number"
              disabled={this.props.disabled}
              hideError={!form.vCardHideCCBINNumber.touched}
            />
          </div>
        </div>
        <h3>Notification Settings</h3>
        <div className="row">
          <div className="col-12 col-md-3">
            <Components.forms.components.checkbox
              form={form}
              field="vCardNotifyOnCreation"
              action={this.standardFormAction}
              label="Notify On Payment Creation"
              disabled={this.props.disabled}
              hideError={!form.vCardNotifyOnCreation.touched}
            />
          </div>
          <div className="col-12 col-md-9">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="vCardNotifyOnCreationEmails"
              action={this.standardFormAction}
              label="Creation Notification Delivery Emails"
              detailedInformation="Comma separate multiple emails, i.e. x,y,z"
              disabled={this.props.disabled || !_try(() => form._values.vCardNotifyOnCreation)}
              hideError={!form.vCardNotifyOnCreationEmails.touched}
              required={_try(() => form._values.vCardNotifyOnCreation)}
            />
          </div>
          <div className="col-12 col-md-3">
            <Components.forms.components.checkbox
              form={form}
              field="vCardNotifyOnCompletion"
              action={this.standardFormAction}
              label="Notify On Payment Completion"
              disabled={this.props.disabled}
              hideError={!form.vCardNotifyOnCompletion.touched}
            />
          </div>
          <div className="col-12 col-md-9">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="vCardNotifyOnCompletionEmails"
              action={this.standardFormAction}
              label="Completion Notification Delivery Emails"
              detailedInformation="Comma separate multiple emails, i.e. x,y,z"
              disabled={this.props.disabled || !_try(() => form._values.vCardNotifyOnCompletion)}
              hideError={!form.vCardNotifyOnCompletionEmails.touched}
              required={_try(() => form._values.vCardNotifyOnCompletion)}
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
              field="notes"
              action={this.standardFormAction}
              label="Notes"
              disabled={this.props.disabled}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_globalVendorProcedureVCard);

const deliveryOptions = {
  email: {
    display: 'Email',
  },
  fax: {
    display: 'Fax',
  },
  phone: {
    display: 'Phone',
  },
  manual: {
    display: 'Manual',
  },
  automation_taiko: {
    display: 'Automation',
  },
};

const binOptions = Utils.getGalileoBinDropdownOptions();


