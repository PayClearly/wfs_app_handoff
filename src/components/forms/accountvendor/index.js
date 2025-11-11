
// Third Party Imports ...
import { Collapse } from 'react-collapse';
import md5 from 'md5';
import {
  connect, Component, Fragment,
} from 'component';
import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';
import config from '../../../apps/app/config.json';

const mapStateToProps = (state) => ({
  countryCodes: Selectors.countryCodes(),
  forms: state.forms,
  types: state.validations.data.item,
  accountVendorsItems: state.account.accountVendors.data.items || {},
  erpIntegration: _try(() => Selectors.integrations(state).erpIntegration, {}),
  paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item || {},
  globalVendors: _try(() => Selectors.globalTaggedItems(state).vendors, {}),
  activeGlobalVendorOptions: _try(() => Selectors.globalTaggedItems(state).activeVendorOptions, {}),
  vendorNamesToId: Selectors.globalTaggedItems(state).vendorNamesToId,
  integrations: _try(() => Selectors.integrations(state), {}),
  providerTheme: Selectors.providerTheme(state),
  cardProvider: _try(() => state.account.cardsIntegration.data.details.provider, null),
  checkProvider: _try(() => state.account.checksIntegration.data.details.provider, null),
});

const mapDispatchToProps = {
  creatERPVendor: Store.account.createErpIntegrationVendor,
  ...Store.forms,
};

class components_forms_accountvendor extends Component {

  state = {
    name: 'Components.forms.accountvendor',
    key: 'default',
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      initialData = {},
    } = this.props;
    const key = this.props.formKey || this.state.key;
    this.setState({ key });

    initialize(this.state.name, key, {
      name: initialData.name || '',
      displayName: initialData.displayName || '',
      globalVendorRef: _try(() => this.props.globalVendors[initialData.globalVendorRef].name, ''),
      vCard: initialData.vCard || false,
      check: initialData.check || false,
      ACH: initialData.ACH || false,
      active: initialData.active !== false,
      erpVendor: initialData.erpVendor || null,
      erpCategory: initialData.erpCategory || null,
      repEmails: (initialData.repEmails || []).join(','),
      notes: initialData.notes || null,

      // Contact Information
      contactName: initialData.contactName || '',
      contactEmail: initialData.contactEmail || '',
      contactPhoneNumber: initialData.contactPhoneNumber || '',
      contactFaxNumber: initialData.contactFaxNumber || '',

      // Payment Instructions
      // vCard
      vCardEmails: (initialData.vCardEmails || []).join(','),
      vCardFaxNumbers: (initialData.vCardFaxNumbers || []).join(','),
      vCardPaymentLimit: initialData.vCardPaymentLimit || null,
      vCardDefaultMaxUses: initialData.vCardDefaultMaxUses || null,
      galileoVCardDefaultMaxUses: initialData.galileoVCardDefaultMaxUses || null,
      vCardFee: Boolean(initialData.vCardFee) || false,
      vCardFeeType: _try(() => initialData.vCardFee.type) || '',
      vCardFeeValue: _try(() => initialData.vCardFee.value) || '',

      // Check
      checkAddressLine1: initialData.checkAddressLine1 || '',
      checkAddressLine2: initialData.checkAddressLine2 || '',
      checkCity: initialData.checkCity || '',
      checkStateProv: initialData.checkStateProv || '',
      checkPostalCode: initialData.checkPostalCode || '',
      checkCountry: initialData.checkCountry || '',
      checkAddressValidated: initialData.checkAddressValidated || null,
      checkAddressUserForceValidated: initialData.checkAddressUserForceValidated || null,
      checkStufferEnabled: initialData.checkStufferEnabled || false,
      // checkFee: Boolean(initialData.checkFee) || false,
      // checkFeeType: _try(() => initialData.checkFee.type) || '',
      // checkFeeValue: _try(() => initialData.checkFee.value) || '',

      // ACH
      // ACHFee: Boolean(initialData.ACHFee) || false,
      // ACHFeeType: _try(() => initialData.ACHFee.type) || '',
      // ACHFeeValue: _try(() => initialData.ACHFee.value) || '',
    });
    validate(this.state.name, key, this.validate);
  }

  componentWillReceiveProps(nextProps = {}) {
    if (!this.props.blurAll && nextProps.blurAll === true) {
      this.props.blur(this.state.name, this.state.key, this.props.forms[this.state.name][this.state.key]._values);
    }
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  checkType = (type, against) => Utils.typesvalidator.validateType(this.props.types, type, against).valid;

  validate = (values) => {
    const vendorType = this.props.types.AccountVendor.properties;
    const { checkProvider } = this.props;
    const errors = {};

    if (values.checkAddressLine1.length > 80 && checkProvider === 'GALILEO') {
      errors.checkAddressLine1 = 'Check address line 1 max length is 80 characters';
    }

    if (values.checkAddressLine2.length > 30 && checkProvider === 'GALILEO') {
      errors.checkAddressLine2 = 'Check address line 2 max length is 30 characters';
    }

    if (values.checkAddressLine1.length >= 60 && checkProvider === 'SMARTPAYABLES') {
      errors.checkAddressLine1 = 'Check address line 1 must be less than 60 characters';
    }

    if (values.checkAddressLine2.length >= 60 && checkProvider === 'SMARTPAYABLES') {
      errors.checkAddressLine2 = 'Check address line 2 must be less than 60 characters';
    }

    if (values.name.length >= 48) {
      errors.name = 'Vendor name must be less than 48 characters';
    }

    if (values.displayName.length >= 48) {
      errors.displayName = 'Display name must be less than 48 characters';
    }

    if (!this.checkType(vendorType.name, values.name)) {
      errors.name = Utils.typesvalidator.validationErrorMsgs.string;
    }

    // Contact details validations
    if (values.contactEmail && !this.checkType('EmailAddress', values.contactEmail)) {
      errors.contactEmail = Utils.typesvalidator.validationErrorMsgs.email;
    }
    if (values.contactPhoneNumber && !this.checkType('PhoneNumber', values.contactPhoneNumber)) {
      errors.contactPhoneNumber = Utils.typesvalidator.validationErrorMsgs.phoneNumber;
    }
    if (values.contactFaxNumber && !this.checkType('PhoneNumber', values.contactFaxNumber)) {
      errors.contactFaxNumber = Utils.typesvalidator.validationErrorMsgs.phoneNumber;
    }

    if (values.repEmails) {
      const invalidItem = values.repEmails.split(',').map((item) => item.trim()).find((item) => !this.checkType('EmailAddress', item));
      if (invalidItem) { errors.repEmails = `${invalidItem} - ${Utils.typesvalidator.validationErrorMsgs.email}`; }
    }

    if (!values.name) {
      errors.name = 'Vendor name is required';
    }

    if (values.name && this.props.accountVendorsItems[md5(values.name)] && !this.props.forUpdate) {
      errors.name = 'This vendor already exists';
    }

    if (this.props.paymentPipelinePreferences.requireVendorLinkToERP && !values.erpVendor) {
      errors.erpVendor = 'You need to link this vendor';
    }

    // vCard validations
    if (values.vCardEmails) {
      const invalidItem = values.vCardEmails.split(',').map((item) => item.trim()).find((item) => !this.checkType('EmailAddress', item));
      if (invalidItem) { errors.vCardEmails = `${invalidItem} - ${Utils.typesvalidator.validationErrorMsgs.email}`; }
    }

    if (values.vCardFaxNumbers) {
      const invalidItem = values.vCardFaxNumbers.split(',').map((item) => item.trim()).find((item) => !this.checkType('PhoneNumber', item));
      if (invalidItem) { errors.vCardFaxNumbers = `${invalidItem} - ${Utils.typesvalidator.validationErrorMsgs.phoneNumber}`; }
    }

    // fee validations
    if (values.vCardFee) {
      if (!values.vCardFeeType) {
        errors.vCardFeeType = 'This field is required';
      }
      if (values.vCardFeeType === 'percentage' && (values.vCardFeeValue > 100 || values.vCardFeeValue <= 0)) {
        errors.vCardFeeValue = 'Fee percentage must be between 0 and 100';
      }
      if (values.vCardFeeType === 'fixed' && values.vCardFeeValue <= 0) {
        errors.vCardFeeValue = 'Fee dollar amount must be greater than $0';
      }
      if (!values.vCardFeeValue) {
        errors.vCardFeeValue = 'This field is required';
      }
    }

    if (values.galileoVCardDefaultMaxUses) {
      if (Number.isNaN(parseInt(values.galileoVCardDefaultMaxUses, 10))) {
        errors.galileoVCardDefaultMaxUses = 'Default max card uses must be a number between 1 and 5';
      }
      if (values.galileoVCardDefaultMaxUses < 1 || values.galileoVCardDefaultMaxUses > 5) {
        errors.galileoVCardDefaultMaxUses = 'Default max card uses must be a number between 1 and 5';
      }
    }

    // WEX only
    if (values.vCardDefaultMaxUses) {
      if (Number.isNaN(parseInt(values.vCardDefaultMaxUses, 10))) {
        errors.vCardDefaultMaxUses = 'Default max card uses must be a number between 1 and 10';
      }

      if (values.vCardDefaultMaxUses < 1 || values.vCardDefaultMaxUses > 10) {
        errors.vCardDefaultMaxUses = 'Default max card uses must be a number between 1 and 10';
      }
    }

    return errors;
  };

  standardFormAction = (action, field, value) => {
    const form = _try(() => this.props.forms[this.state.name][this.state.key], null);
    if (!form) { return null; }

    const fields = {};
    fields[field] = value;

    const NOT_LINKED_DISPLAY = '';

    if (field === 'globalVendorRef') {

      if (action === 'blur' && !Object.values(this.props.globalVendors).some((option) => form._values.globalVendorRef === option.name)) {
        this.props.change(this.state.name, this.state.key, field, NOT_LINKED_DISPLAY);
        this.props.validate(this.state.name, this.state.key, this.validate);
      }
    }

    if (action === 'change') {
      if (field === 'checkAddressLine1' || field === 'checkAddressLine2' || field === 'checkCity' || field === 'checkStateProv' || field === 'checkPostalCode' || field === 'checkCountry') {
        fields.checkAddressValidated = null;
        fields.checkAddressUserForceValidated = null;
      }
      if (field === 'vCardFee' && value === false) {
        fields.vCardFeeType = '';
        fields.vCardFeeValue = '';
      }
      this.props[action](this.state.name, this.state.key, fields);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  erpVendorCreate = (name) => {
    if (this.props.erpIntegration.status.updating) { return; }
    this.props.creatERPVendor({ name });
  };

  payClearlyNameToVendorId = (name) => {
    const globalVendor = Object.values(this.props.globalVendors || {})
      .find((item) => name && item.name === name) || {};
    return globalVendor._id || null;
  };

  renderPaymentMethods = (form) => {
    const countries = Object.entries(this.props.countryCodes).reduce((acc, [code, name]) => {
      acc[code] = { display: name };
      return acc;
    }, {});
    const {
      paymentPipelinePreferences, globalVendors, integrations, vendorNamesToId, cardProvider,
    } = this.props;

    const methodStates = {
      vCard: {
        accepted: form._values.vCard,
        selfServe: false,
        linked: false,
        title: 'Card',
        icon: 'mdi-credit-card-outline',
      },
      ACH: {
        accepted: form._values.ACH,
        selfServe: false,
        linked: false,
        title: 'ACH',
        icon: 'mdi-bank',
      },
      check: {
        accepted: form._values.check,
        selfServe: false,
        linked: false,
        title: 'Check',
        icon: 'mdi-email-outline',
      },
    };

    if (form._values.globalVendorRef && _try(() => vendorNamesToId[form._values.globalVendorRef])) {
      const globalVendorId = vendorNamesToId[form._values.globalVendorRef];
      ['vCard', 'check', 'ACH'].forEach((method) => { methodStates[method].linked = true; });
      const tagsToLookThrough = paymentPipelinePreferences.globalVendorTagIds || [];
      tagsToLookThrough.forEach((tagId) => {
        ['vCard', 'check', 'ACH'].forEach((method) => {
          if (_try(() => globalVendors[globalVendorId].tags[tagId][method].accepts)) { methodStates[method].accepted = true; }
        });
      });
    }

    if (!_try(() => integrations.cardsIntegration.linked)) { methodStates.vCard.selfServe = true; }
    if (!_try(() => integrations.checksIntegration.linked)) { methodStates.check.selfServe = true; }
    if (!_try(() => integrations.achIntegration.linked)) { methodStates.ACH.selfServe = true; }

    const allowPCtoHandle = {
      vCard: true,
      ACH: true,
      check: _try(() => paymentPipelinePreferences.allowPCtoHandle.check),
    };
    ['vCard', 'check', 'ACH'].forEach((method) => {
      if (methodStates[method].linked && !methodStates[method].selfServe && !allowPCtoHandle[method]) {
        methodStates[method].linked = false;
        methodStates[method].accepted = form._values[method];
      }
    });

    return (
      <div>
        <Components.tabs defaultTab="vCard">
          {Object.keys(methodStates).map((method) => {
            const methodState = methodStates[method];
            const { title } = methodState;
            const { icon } = methodState;
            const navItemComponents = [];
            switch (method) {
              case 'vCard':
                if (
                  (form.vCard.error && form.vCard.visited)
                  || (form.vCardEmails.error && form.vCardEmails.touched)
                  || (form.vCardFaxNumbers.error && form.vCardFaxNumbers.touched)) { navItemComponents.push(<span className="tabAlertIconBackground" />, <i className="mdi mdi-alert-circle-outline text-danger tabAlertIcon" />); }

                break;
              case 'check':
                if (
                  (form.check.error && form.check.visited)
                  || (form.checkAddressLine1.error && form.checkAddressLine1.touched)
                  || (form.checkAddressLine2.error && form.checkAddressLine2.touched)
                  || (form.checkCity.error && form.checkCity.touched)
                  || (form.checkStateProv.error && form.checkStateProv.touched)
                  || (form.checkCountry.error && form.checkCountry.touched)
                  || (form.checkPostalCode.error && form.checkPostalCode.touched)) { navItemComponents.push(<span className="tabAlertIconBackground" />, <i className="mdi mdi-alert-circle-outline text-danger tabAlertIcon" />); }

                break;
              case 'ACH':
                if (form.ACH.error && form.ACH.visited) { navItemComponents.push(<span className="tabAlertIconBackground" />, <i className="mdi mdi-alert-circle-outline text-danger tabAlertIcon" />); }
                break;
              default:
                break;
            }

            if (methodState.accepted) {
              if (methodState.selfServe) {
                navItemComponents.push(
                  <Components.tooltip className="tabStakeholderIcon">
                    <i className="mdi mdi-account-circle text-primary" />
                    <div>Self Serve</div>
                  </Components.tooltip>
                );
              } else if (methodState.linked) {
                navItemComponents.push(
                  <Components.tooltip className="tabStakeholderIconImg">
                    <img src={config.favicon} alt={`${this.props.providerTheme.displayName} Logo`} />
                    <div>Managed by {this.props.providerTheme.displayName}</div>
                  </Components.tooltip>
                );
              } else {
                navItemComponents.push(
                  <Components.tooltip className="tabStakeholderIcon">
                    <i className="mdi mdi-check-circle text-primary" />
                    <div>Managed by Account</div>
                  </Components.tooltip>
                );
              }
            }

            const erpError = form.erpVendor?.error;
            return (
              <Components.tab
                name={method}
                label={title}
                iconClassName={`${icon} mdi-36px`}
                tabNavItemClassName="position-relative center-content"
                navItemComponents={navItemComponents}
                isValidTab
              >
                <div className="tab-container">
                  {methodState.linked
                    && (
                      <div>
                        {methodState.accepted && !methodState.selfServe
                          && (
                            <div className="alert alert-primary m-0" role="alert">
                              <h4 className="alert-heading">Managed by {this.props.providerTheme.displayName}</h4>
                              {title} payment instructions for this vendor are managed by {this.props.providerTheme.displayName}.
                              <br /><br />
                              If you have any questions please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
                            </div>
                          )}
                        {methodState.accepted && methodState.selfServe
                          && (
                            <div className="alert alert-warning m-0" role="alert">
                              <h4 className="alert-heading">Self Serve Payment</h4>
                              This account has not been set up with a {title} Payment Integration. {title} payments created for this vendor will need to be completed manually. <strong>All relevant notification and ERP/Accounting actions will still be completed on your behalf.</strong>
                              <br /><br />
                              If you wish to utilize {this.props.providerTheme.displayName}'s payment services for this method, please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
                            </div>
                          )}
                        {!methodState.accepted
                          && (
                            <div className="alert alert-secondary m-0" role="alert">
                              <h4 className="alert-heading">{title} Payments not Accepted</h4>
                              This vendor does not accept this payment method.
                              <br /><br />
                              If you have any questions please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
                            </div>
                          )}
                      </div>
                    )}
                  {
                    erpError
                    && <div className="alert alert-danger" role="alert">
                      <h4 className="alert-heading">Alert</h4>
                      <p>An account setting requires vendors to be linked to an ERP integration.</p>
                      <p>Ensure this setting is properly configured before editing vendors.</p>
                    </div>
                  }
                  {(cardProvider === 'GALILEO' || cardProvider === 'GALILEOSTUB') && (
                    <div className="row pt-3">
                      <div className="col-12 col-md-6">
                        <Components.forms.components.textinput
                          form={form}
                          field="galileoVCardDefaultMaxUses"
                          action={this.standardFormAction}
                          label={'Max Card Uses (Optional)'}
                          labelKey="name"
                          hideError={!form.galileoVCardDefaultMaxUses.touched}
                          type="number"
                        />
                      </div>
                    </div>
                  )}
                  {(cardProvider === 'EFS' || cardProvider === 'STUB') && (
                    <div className="row pt-3">
                      <div className="col-12 col-md-6">
                        <Components.forms.components.textinput
                          form={form}
                          field="vCardDefaultMaxUses"
                          action={this.standardFormAction}
                          label={'Max Card Uses (Optional)'}
                          labelKey="name"
                          hideError={!form.vCardDefaultMaxUses.touched}
                          type="number"
                        />
                      </div>
                    </div>
                  )}
                  {!methodState.linked
                    && (
                      <Fragment>
                        {form[method].error && form[method].visited
                          && (
                            <div className="alert alert-danger" role="alert">
                              {form[method].error}
                            </div>
                          )}
                        <div className="row pt-3">
                          <div className="col-12">
                            <Components.forms.components.switch
                              form={form}
                              field={method}
                              action={this.standardFormAction}
                              label={`Accepts ${method === 'ACH' ? title : `${title}s`}`}
                              disabled={this.props.disabled}
                              hideError={!form[method].touched}
                            />
                          </div>
                        </div>
                      </Fragment>
                    )}
                  <Collapse isOpened={form._values[method] && !methodState.linked}>
                    {methodState.selfServe
                      && (
                        <div className="pt-1">
                          <div className="alert alert-warning m-0" role="alert">
                            <h4 className="alert-heading">Self Serve Payment</h4>
                            This account has not been set up with a {title} Payment Integration. {title} payments created for this vendor will need to be completed manually. <strong>All relevant notification and ERP/Accounting actions will still be completed on your behalf.</strong>
                            <br /><br />
                            If you wish to utilize {this.props.providerTheme.displayNamePlural} payment services for this method, please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
                          </div>
                        </div>
                      )}
                    {!methodState.selfServe
                      && <Fragment>
                        <h3 className="m-0">
                          Payment Instructions
                        </h3>
                        {method === 'vCard'
                          && <Fragment>
                            <p className="m-0"><small className="text-muted">Set delivery addresses for card payments to be sent to, if left blank the card information will need to be delivered manually</small></p>
                            <div className="row pt-3">
                              <div className="col-12 col-md-6">
                                <Components.forms.components.textinput
                                  form={form}
                                  type="text"
                                  field="vCardEmails"
                                  action={this.standardFormAction}
                                  label="Card Delivery Emails (Optional)"
                                  disabled={this.props.disabled}
                                  hideError={!form.vCardEmails.touched}
                                />
                              </div>
                              <div className="col-12 col-md-6">
                                <Components.forms.components.textinput
                                  form={form}
                                  type="text"
                                  field="vCardFaxNumbers"
                                  action={this.standardFormAction}
                                  label="Card Delivery Faxes (Optional)"
                                  disabled={this.props.disabled}
                                  hideError={!form.vCardFaxNumbers.touched}
                                />
                              </div>
                              {/* Placeholder for manual notes in the case of manual payment */}
                            </div>
                            <h4 className="mb-3">
                              Additional Options
                            </h4>
                            <div className="row">
                              <div className="col-12 col-md-6">
                                <Components.forms.components.textinput
                                  form={form}
                                  field="vCardPaymentLimit"
                                  action={this.standardFormAction}
                                  label={'Card Payment Limit (Optional)'}
                                  labelKey="name"
                                  hideError={!form.vCardPaymentLimit.touched}
                                  type="number"
                                />
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-12 mb-1">
                                <Components.forms.components.checkbox
                                  form={form}
                                  field="vCardFee"
                                  action={this.standardFormAction}
                                  label={'This vendor charges a fee for card payments'}
                                />
                              </div>
                              {form.vCardFee.value
                                && (
                                  <Fragment>
                                    <div className="col-12 col-md-6">
                                      <Components.forms.components.selectinput
                                        form={form}
                                        field="vCardFeeType"
                                        action={this.standardFormAction}
                                        label="Fee Type"
                                        options={FEE_TYPE_OPTIONS}
                                        placeholder={FEE_TYPE_OPTIONS[form.vCardFeeType.value] && FEE_TYPE_OPTIONS[form.vCardFeeType.value].display || ''}
                                        required={form.vCardFee.value}
                                        disabled={!form.vCardFee.value}
                                        hideError={!form.vCardFeeType.touched}
                                      />
                                    </div>
                                    <div className="col-12 col-md-6">
                                      <Components.forms.components.maskedinput
                                        form={form}
                                        maskPlaceholder=""
                                        type="string"
                                        field="vCardFeeValue"
                                        action={this.standardFormAction}
                                        label={(() => {
                                          let modifier;
                                          if (form.vCardFeeType.value) {
                                            modifier = form.vCardFeeType.value === 'fixed' ? 'Dollar Amount' : 'Percentage';
                                          }
                                          return `Fee ${modifier || 'Value'}`;
                                        })()}
                                        required={form.vCardFee.value}
                                        disabled={!form.vCardFee.value}
                                        hideError={!form.vCardFeeValue.touched}
                                        useNumberMask
                                        noPrefix={form.vCardFeeType.value === 'percentage'}
                                        suffix={form.vCardFeeType.value === 'percentage' ? '%' : false}
                                      />
                                    </div>
                                  </Fragment>
                                )}
                            </div>
                          </Fragment>}
                        {method === 'ACH'
                          && <Fragment>
                            <p className="m-0"><small className="text-muted">Set instructions for ACH payments</small></p>
                            <div className="pt-1">
                              <div className="alert alert-warning m-0" role="alert">
                                <h4 className="alert-heading">{this.props.providerTheme.displayName} Link Needed</h4>
                                You must link with a {this.props.providerTheme.displayName} vendor to be able to send ACH payments via our platform.
                                <br /><br />
                                If you have any questions please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
                              </div>
                            </div>
                          </Fragment>}
                        {method === 'check'
                          && <Fragment>
                            <p className="m-0"><small className="text-muted">Set check payment delivery address</small></p>
                            <div className="row pt-3">
                              <div className="col-12 col-md-12">
                                <Components.forms.components.textinput
                                  form={form}
                                  type="text"
                                  field="checkAddressLine1"
                                  action={this.standardFormAction}
                                  label="Address Line 1"
                                  disabled={this.props.disabled}
                                  hideError={!form.checkAddressLine1.touched}
                                />
                              </div>
                              <div className="col-12 col-md-12">
                                <Components.forms.components.textinput
                                  form={form}
                                  type="text"
                                  field="checkAddressLine2"
                                  action={this.standardFormAction}
                                  label="Address Line 2 (Optional)"
                                  disabled={this.props.disabled}
                                  hideError={!form.checkAddressLine2.touched}
                                />
                              </div>
                              <div className="col-12 col-md-6">
                                <Components.forms.components.textinput
                                  form={form}
                                  type="text"
                                  field="checkCity"
                                  action={this.standardFormAction}
                                  label="City"
                                  disabled={this.props.disabled}
                                  hideError={!form.checkCity.touched}
                                />
                              </div>
                              <div className="col-12 col-md-2">
                                <Components.forms.components.textinput
                                  form={form}
                                  type="text"
                                  field="checkStateProv"
                                  action={this.standardFormAction}
                                  label="State"
                                  disabled={this.props.disabled}
                                  hideError={!form.checkStateProv.touched}
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <Components.forms.components.textinput
                                  form={form}
                                  type="text"
                                  field="checkPostalCode"
                                  action={this.standardFormAction}
                                  label="Zip Code"
                                  disabled={this.props.disabled}
                                  hideError={!form.checkPostalCode.touched}
                                />
                              </div>
                              <div className="col-12 col-md-6">
                                <Components.forms.components.selectinput
                                  form={form}
                                  type="text"
                                  field="checkCountry"
                                  options={countries}
                                  action={this.standardFormAction}
                                  label="Country"
                                  disabled={this.props.disabled}
                                  hideError={!form.checkCountry.touched}
                                />
                              </div>
                              <div className="col-12">
                                <Components.forms.components.switch
                                  form={form}
                                  field="checkStufferEnabled"
                                  action={this.standardFormAction}
                                  label={'Add Check Stuffer'}
                                  disabled={this.props.disabled}
                                  hideError={!form[method].touched}
                                />
                              </div>
                            </div>
                          </Fragment>}
                      </Fragment>}
                  </Collapse>
                </div>
              </Components.tab>
            );
          })}
        </Components.tabs>
      </div>
    );
  };

  render() {
    const form = _try(() => this.props.forms[this.state.name][this.state.key], null);
    if (!form) { return null; }

    /**
     * Galileo does not support updating the biller name after it has been created.
     * A name change requries creating a new biller
     * then adding the new billerId to the account vendor resource in Firebase
     */
    const isGalileoChecksIntegration = this.props.integrations?.checksIntegration?.provider === 'GALILEO';
    let galileoBillerExists = false;
    if (this.props.forUpdate && isGalileoChecksIntegration) {
      // name should always exist in the form since we are editing a vendor
      const name = form.name?.value || '';
      const vendorId = md5(name);
      const vendor = this.props.accountVendorsItems?.[vendorId] || {};
      galileoBillerExists = Boolean(vendor.billerId);
    }

    return (
      <form className="floating-labels components_forms_accountvendor">
        <h3 className="m-0">Vendor Details</h3>
        <div className="row pt-4">
          <div className="col-12 col-md">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="name"
              action={this.standardFormAction}
              label="Name"
              disabled={this.props.forUpdate || this.props.disabled}
              hideError={!form.name.touched}
              required
            />
          </div>
          <div className="col-12 col-md">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="displayName"
              action={this.standardFormAction}
              label="Display Name (Optional)"
              disabled={this.props.disabled || galileoBillerExists}
              hideError={!form.displayName.touched}
            />
          </div>
          <div className="col-12 col-md">
            <Components.forms.components.typeahead
              form={form}
              field="globalVendorRef"
              action={this.standardFormAction}
              label={`Link with a ${this.props.providerTheme.displayName} vendor`}
              options={this.props.activeGlobalVendorOptions}
              labelKey="name"
              hideError={!form.globalVendorRef.touched}
              disabled={this.props.disabled}
            />
          </div>
          {this.props.forUpdate
            && (
              <div className="col-12 col-md-2">
                <Components.forms.components.switch
                  form={form}
                  field="active"
                  action={this.standardFormAction}
                  label="Active"
                  disabled={this.props.disabled}
                />
              </div>
            )}
        </div>
        {this.renderPaymentMethods(form)}
        <h3 className="m-0 pt-3">Notification Settings</h3>
        <div className="row pt-3">
          <div className="col">
            <Components.forms.components.textinput
              form={form}
              field="repEmails"
              action={this.standardFormAction}
              label="Rep Contact Emails"
              hideError={!form.repEmails.touched}
              detailedInformation="Comma separate multiple emails, i.e. x,y,z"
              disabled={this.props.creating}
            />
          </div>
        </div>
        {this.props.erpIntegration && this.props.erpIntegration.linked
          && <Fragment>
            <h3 className="m-0 pt-3">ERP/Accounting Integration Settings</h3>
            <div className="row pt-3">
              <div className="col-12 col-md-6">
                <Components.forms.components.referenceinput
                  form={form}
                  field="erpVendor"
                  action={this.standardFormAction}
                  label="ERP Vendor"
                  disabled={this.props.creating || _try(() => this.props.erpIntegration.settings.disableManualERPLinks)}
                  hideError={!form.erpVendor.touched}
                  refPath="account.erpIntegration.data.resources.vendors"
                  refKey="name"
                  noItemsText={(() => {
                    const erpIntegrationProviderName = _try(() => this.props.erpIntegration.providerInfo.name, 'Your ERP');
                    if (_try(() => this.props.erpIntegration.status.updating)) { return 'Creating...'; }
                    if (_try(() => this.props.erpIntegration.settings.disableERPVendorCreate)) { return `Not Found in ${erpIntegrationProviderName}`; }
                    return `Create this Vendor in ${erpIntegrationProviderName}`;
                  })()}
                  noItemsClicked={(e, text) => {
                    if (_try(() => this.props.erpIntegration.settings.disableERPVendorCreate)) { return; }
                    this.erpVendorCreate(text);
                  }}
                />
              </div>
              <div className="col-12 col-md-6">
                <Components.forms.components.referenceinput
                  form={form}
                  field="erpCategory"
                  action={this.standardFormAction}
                  label="ERP Category"
                  disabled={this.props.creating || _try(() => this.props.erpIntegration.settings.disableManualERPLinks)}
                  hideError={!form.erpCategory.touched}
                  refPath="account.erpIntegration.data.resources.categories"
                  refKey="name"
                />
              </div>
            </div>
          </Fragment>}
        <h3 className="m-0 pt-3">Contact Details</h3>
        <div className="row pt-3">
          <div className="col-12 col-md-3">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="contactName"
              action={this.standardFormAction}
              label="Contact Name"
              disabled={this.props.disabled}
              hideError={!form.contactName.touched}
              detailedInformation=""
            />
          </div>
          <div className="col-12 col-md-3">
            <Components.forms.components.textinput
              form={form}
              type="text"
              field="contactEmail"
              action={this.standardFormAction}
              label="Contact Email"
              disabled={this.props.disabled}
              hideError={!form.contactEmail.touched}
            />
          </div>
          <div className="col-12 col-md-3">
            <Components.forms.components.maskedinput
              mask={['1', '-', /[1-9]/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
              maskPlaceholder="1-555-555-5555"
              form={form}
              type="tel"
              field="contactPhoneNumber"
              action={this.standardFormAction}
              label="Contact Phone Number"
              hideError={!form.contactPhoneNumber.touched}
              disabled={this.props.updating}
            />
          </div>
          <div className="col-12 col-md-3">
            <Components.forms.components.maskedinput
              mask={['1', '-', /[1-9]/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
              maskPlaceholder="1-555-555-5555"
              form={form}
              type="tel"
              field="contactFaxNumber"
              action={this.standardFormAction}
              label="Contact Fax Number"
              hideError={!form.contactFaxNumber.touched}
              disabled={this.props.updating}
            />
          </div>
        </div>
        <div className="row pt-3">
          <div className="col-12 col-md-12">
            <Components.forms.components.textArea
              form={form}
              type="text"
              field="notes"
              action={this.standardFormAction}
              label="Payment Notes"
              disabled={this.props.disabled}
            />
          </div>
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_accountvendor);

// Internal Helper Functions ...
const FEE_TYPE_OPTIONS = {
  fixed: {
    display: 'Fixed',
  },
  percentage: {
    display: 'Percentage',
  },
};

// GENERATOR_TYPE='component';
