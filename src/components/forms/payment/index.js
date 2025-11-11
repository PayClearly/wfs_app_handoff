
// Third Party Imports ...
import numeral from 'numeral';
import { Collapse } from 'react-collapse';
import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

import { lineItemFilterConfig } from './constants';
import { providerDefaultVCardMaxUses } from '../constants';

const mapStateToProps = (state, props) => ({
  types: state.validations.data.item,
  selectedVendors: Selectors.accountVendors(state).active,
  clientsData: _resolve(state, 'account.clients.data.items'),
  clientsCollections: _resolve(state, 'account.clients.collections'),
  clientVendorLinksCollectionsIds: _resolve(state, 'account.clientVendorLinks.collections._ids'),
  accountVendorNamesToIds: Selectors.accountVendorNamesToIds(state),
  derived: Selectors.paymentform(props.formKey || 'default')(state),
  preferences: state.account.paymentPipelinePreferences.data.item,
  paymentCustomFields: state.account.paymentCustomFields.data.item,
  erpIntegrationLinked: Selectors.integrations(state).erpIntegration.linked,
  checkNumbers: Selectors.checkNumbers(state),
  customFormValues: _try(() => state.forms['Components.forms.custom'][`customFields-${props.formKey || 'default'}`]._values),
  lineItemsMeta: Selectors.uploadLineItems(props.formKey)(state),
  lineItemTable: _try(() => state.tables['Components.forms.lineItems'][props.formKey]),
  providerTheme: Selectors.providerTheme(state),
  cardsIntegrationProvider: Selectors.integrations(state).cardsIntegration.provider,
  provider: state.account.cardsIntegration.data.details.provider,
});

const mapDispatchToProps = (dispatch) => ({
  navigateTo: (routeName, routeParams, routeOptions) => {
    dispatch(Store.router.navigateTo(routeName, routeParams, routeOptions));
  },
  openModal: (name, data) => {
    dispatch(Store.router.openModal(name, data));
  },
  ...bindActionCreators(Store.forms, dispatch),
  changePagination: (tableName, tableKey, paginationData) => {
    dispatch(Store.tables.changePagination(tableName, tableKey, paginationData));
  },
  resetTableFilters: (tableName, tableKey) => {
    dispatch(Store.tables.resetFilters(tableName, tableKey));
  },
});

class components_forms_payment extends Component {

  state = {
    name: 'Components.forms.payment',
    key: 'default',
  };

  componentDidMount() {
    const {
      initialize,
      validate,
      initialData = {},
      blurAll,
      preferences = {},
      provider,
    } = this.props;

    const key = this.props.formKey || this.state.key;
    const hasLineItems = !!_resolve(initialData, 'lineItems.length', 0);
    this.setState({ key, hasLineItems });

    const twoWeeksOut = new Date();
    twoWeeksOut.setDate(twoWeeksOut.getDate() + 30);

    let amount = initialData.amount || '';
    if (this.props.isCommission && preferences.defaultCommissionRate) {
      amount = Utils.calculateCommission(
        this.props.aggregatedNonCommissionPaymentsTotal,
        preferences.defaultCommissionRate,
        preferences.commissionOffsetPercentage
      );
    }

    /**
     * If the card provider is Galileo, determine the default max card uses.
     * Priority is as follows:
     * account vendor setting > account preference > provider default > 1
     * account vendor isn't known until selected on this form.
     */
    const { galileoVCardDefaultMaxUses, vCardDefaultMaxUses /** WEX only */ } = this.props.preferences;
    const maxCardUsesSetting = galileoVCardDefaultMaxUses || vCardDefaultMaxUses;
    const maxCardUses = maxCardUsesSetting || providerDefaultVCardMaxUses[provider] || 1;

    const formData = {
      vendorName: initialData.vendorName || '',
      globalVendorTagName: null,
      amount,
      method: initialData.method || null,
      clientName: initialData.clientName || '',
      acceptsVendorFee: preferences.autoAcceptsFees || false,
      overrideFeeRules: convertToBoolean(initialData.overrideFeeRules),

      // --- notifications
      repEmails: initialData.repEmails || '',

      // --- vCard
      // These initialized fields will likely need to be re-mapped to where they are located on the payment option...
      // ...when update payment is implemented
      vCardEmails: initialData.vCardEmails || '',
      vCardFaxNumbers: initialData.vCardFaxNumbers || '',
      vCardUsageLimit: initialData.vCardUsageLimit || maxCardUses,
      vCardRequireExactMatch: initialData.vCardRequireExactMatch || false,
      vCardRegion: initialData.vCardRegion || this.props.preferences.defaultCardRegion || 'USA',
      vCardValidThrough: initialData.vCardValidThrough || twoWeeksOut,

      // --- payables
      invoiceId: this.props.invoiceId || null,

      // --- commissions
      isCommission: this.props.isCommission || null,
      commissionRate: this.props.isCommission ? this.props.preferences.defaultCommissionRate || '' : null,
    };

    initialize(this.state.name, key, formData);
    validate(this.state.name, key, this.validate);

    if (blurAll) {
      this.props.blur(this.state.name, key, formData);
    }
  }

  componentDidUpdate(prevProps = {}) {
    const { provider } = this.props;

    const vendorMaxCardUses = (
      this.props.derived?.selectedVendor?.galileoVCardDefaultMaxUses
      || this.props.derived?.selectedVendor?.vCardDefaultMaxUses
    );

    const previousVendorMaxCardUses = (
      prevProps.derived?.selectedVendor?.galileoVCardDefaultMaxUses
      || prevProps.derived?.selectedVendor?.vCardDefaultMaxUses
    );

    const vendorMaxCardUsesChanged = vendorMaxCardUses !== previousVendorMaxCardUses;

    const preferencesMaxCardUses = (
      this.props.preferences?.galileoVCardDefaultMaxUses
      || this.props.preferences?.vCardDefaultMaxUses
    );

    // The order here is important -- account vendor setting > account preference > provider default > 1
    const maxCardUsesSettingToApply = vendorMaxCardUses
      || preferencesMaxCardUses
      || providerDefaultVCardMaxUses[provider]
      || 1;

    if (_try(() => (
      prevProps.derived.form._values.acceptsVendorFee !== this.props.derived.form._values.acceptsVendorFee)
      || (prevProps.derived.selectedVendor.needsAttention !== this.props.derived.selectedVendor.needsAttention))
      || _try(() => prevProps.derived.PSOP.fee.type) !== _try(() => this.props.derived.PSOP.fee.type)
      || (_resolve(prevProps, 'derived.form.clientName.error') && (_resolve(prevProps, 'derived.selectedClient.name') !== _resolve(this.props, 'derived.selectedClient.name')))
    ) {
      this.props.validate(this.state.name, this.state.key, this.validate);
    }

    if (prevProps.isCommission && _try(() => prevProps.aggregatedNonCommissionPaymentsTotal !== this.props.aggregatedNonCommissionPaymentsTotal)) {
      this.standardFormAction('change', 'amount', Utils.calculateCommission(this.props.aggregatedNonCommissionPaymentsTotal, _try(() => this.props.derived.form._values.commissionRate, 0), _resolve(this.props, 'preferences.commissionOffsetPercentage')));
    }

    if (_try(() => (!prevProps.derived && this.props.derived) || (prevProps.derived.form._values !== this.props.derived.form._values))) {
      this.resolve();
    }

    if (this.state.hasLineItems && _try(() => prevProps.derived.lineItemTotal !== this.props.derived.lineItemTotal)) {
      this.standardFormAction('change', 'amount', this.props.derived.lineItemTotal);
    }
    if (this.state.hasLineItems && _try(() => Object.keys(prevProps.lineItemsMeta.form._values).length) && !_try(() => Object.keys(this.props.lineItemsMeta.form._values).length)) {
      this.setState({ hasLineItems: false });
    }
    if (!prevProps.blurAll && this.props.blurAll) {
      _try(() => this.props.blur(this.state.name, this.state.key, this.props.derived.form._values));
    }
    if (vendorMaxCardUsesChanged) {
      this.standardFormAction('change', 'vCardUsageLimit', maxCardUsesSettingToApply);
    }
  }

  componentWillUnmount() {
    this.props.destroy(this.state.name, this.state.key);
  }

  checkType = (type, against) => Utils.typesvalidator.validateType(this.props.types, type, against).valid;

  validate = (values) => {
    const derived = _try(() => this.props.derived);
    if (!derived) { return {}; }
    const {
      PSOP,
      tagOptions,
      selectedVendor,
      lineItemTotal,
    } = derived;
    const errors = {};

    if (values.amount < 1 || !values.amount) {
      const allowLessThanOneDollar = this.props.cardsIntegrationProvider === 'GALILEO'
        && this.props.preferences?.allowPaymentsLessThanOneDollar === true;

      if (!allowLessThanOneDollar && values.amount < 1) {
        errors.amount = 'Amount must be at least $1';
      }
    }

    if (lineItemTotal && values.amount && lineItemTotal !== Utils.addDollars([values.amount])) {
      errors.amount = 'Amount must equal sum of line item totals';
    }

    if (selectedVendor.vCardPaymentLimit && values.method === 'vCard' && Number(values.amount) > Number(selectedVendor.vCardPaymentLimit)) {
      errors.amount = `This vendor does not accept card payments over $${selectedVendor.vCardPaymentLimit}`;
    }

    if (values.isCommission) {
      if (_try(() => values.amount < 1) || !_try(() => values.amount)) {
        errors.commissionRate = 'Commission must be at least $1';
      }

      if (values.commissionRate <= 0 || !values.commissionRate) {
        errors.commissionRate = 'Commission must be greater than 0%';
      }
    }

    if (!this.props.accountVendorNamesToIds[values.vendorName]) {
      errors.vendorName = `${values.vendorName} does not exist`;
    }

    if (!_try(() => values.vendorName.length, false)) {
      errors.vendorName = 'Vendor name is required';
    }

    if (values.clientName && !this.props.clientsCollections.names[values.clientName]) {
      errors.clientName = `${values.clientName} does not exist`;
    }

    if (_try(() => this.props.preferences.requireVendorLinkToERP && selectedVendor.name && !selectedVendor.linkedWithERP)) {
      errors.vendorName = 'Vendor not linked to ERP';
    }

    if (Object.keys(tagOptions || {})[0] && !values.globalVendorTagName) {
      errors.globalVendorTagName = 'Vertical is required';
    }

    if (!_try(() => values.method.length, false)) {
      errors.method = 'Method is required';
    }
    if (values.method === 'check' && selectedVendor.needsAttentionCheckAddressNotValidated) {
      errors.vendorName = 'Address validation required';
    }

    // rep contact email
    if (values.repEmails) {
      const emails = values.repEmails.split(',');
      if (emails.some((email) => !this.checkType('EmailAddress', email))) {
        errors.repEmails = emails.length > 1 ? 'All emails must be valid email addresses' : Utils.typesvalidator.validationErrorMsgs.email;
      }
    }

    // delivery methods
    if (values.vCardEmails) {
      const emails = values.vCardEmails.split(',');
      if (emails.some((email) => !this.checkType('EmailAddress', email))) {
        errors.vCardEmails = emails.length > 1 ? 'All emails must be valid email addresses' : Utils.typesvalidator.validationErrorMsgs.email;
      }
    }
    if (values.vCardFaxNumbers) {
      const faxNumbers = values.vCardFaxNumbers.split(',');
      if (faxNumbers.some((faxNumber) => !this.checkType('PhoneNumber', faxNumber))) {
        errors.vCardFaxNumbers = faxNumbers.length > 1 ? 'All fax numbers must be valid.]' : Utils.typesvalidator.validationErrorMsgs.phoneNumber;
      }
    }

    if (values.vCardFaxNumbers && values.vCardEmails) {
      const message = 'Cannot have both email and fax delivery addresses';
      errors.vCardEmails = message;
      errors.vCardFaxNumbers = message;
    }

    if (_try(() => PSOP.fee.type) && !values.acceptsVendorFee) {
      errors.acceptsVendorFee = 'Must accept vendor service fee';
    }

    if (_try(() => values.vCardUsageLimit < 1)) {
      errors.vCardUsageLimit = 'Max uses must 1 or greater';
    }

    // vCardValidThrough
    const now = new Date();
    if (_try(() => values.vCardValidThrough <= now)) {
      errors.vCardValidThrough = 'Must be later than today';
    }

    if (_try(() => values.vCardValidThrough.getTime() > Utils.dates.plusThreeYears(Date.now()))) {
      errors.vCardValidThrough = 'Must be less than 3 years in the future';
    }

    return errors;
  };

  resolver = (key, field, values) => {
    const derived = _try(() => this.props.derived);
    if (!derived) { return {}; }
    const resolved = {};

    const {
      paymentOptions,
      tagOptions,
      selectedVendor,
      PSOP,
      // fee,
    } = derived;

    const {
      initial,
      value,
      touched,
    } = field;

    if (key === 'globalVendorTagName') {

      const initalOption = _findOption(tagOptions, initial);
      const currentOption = _findOption(tagOptions, value);
      const firstOption = Object.keys(tagOptions || {})[0];

      if (value && !currentOption) { resolved[key] = null; }

      if (!value) {
        if (initalOption) { resolved[key] = initalOption; }
        if (!initial && firstOption) { resolved[key] = firstOption; }
      }

    }

    if (key === 'method') {

      const currentOption = _findOption(paymentOptions, value);
      const initalOption = _findOption(tagOptions, initial);
      const firstOption = Object.keys(paymentOptions || {})[0];

      if (value && !currentOption && Object.keys(paymentOptions || {}).length > 0) { resolved[key] = null; }

      if (!value) {
        if (initalOption || firstOption) { resolved[key] = initalOption || firstOption; }
      }

    }

    if (key === 'repEmails') {
      if (value && !PSOP.accepts) {
        resolved[key] = '';
      }
      if (!value && PSOP.accepts && (_try(() => selectedVendor.repEmails.length) || _try(() => initial.length))) {
        resolved[key] = `${(selectedVendor.repEmails || []).join(',')},${initial || ''}`.split(',').filter((item) => item).map((item) => item.trim()).join(',');
      }
    }

    if (key === 'erpVendor' || key === 'erpCategory') {
      if (value !== (selectedVendor[key] || null) && !touched && PSOP.accepts) { resolved[key] = selectedVendor[key] || null; }
      if ((value || resolved[key]) && !PSOP.accepts) { resolved[key] = null; }
    }

    if (key === 'vCardRequireExactMatch') {

      const { disableVCardExactMatchDefault = false } = this.props.preferences;
      if (value === true) {

        if (values?.vCardUsageLimit > 1) {

          resolved[key] = false;
        }
      }
      if (value === false) {

        if (values?.vCardUsageLimit === 1 && !disableVCardExactMatchDefault) {
          resolved[key] = true;
        }
      }
    }

    if ((key === 'vCardEmails' || key === 'vCardFaxNumbers') && value && _try(() => values.vCardUsageLimit > 1)) {
      resolved[key] = '';
    }

    return resolved;
  };

  resolve = () => {
    const derived = _try(() => this.props.derived);
    if (!derived) { return null; }
    const values = derived.form._values;

    const resolved = Object.keys(values)
      .reduce((acc, key) => ({
        ...acc,
        ...this.resolver(key, derived.form[key], values, derived),
      }), {});

    if (Object.keys(resolved).length) {
      this.standardFormAction('change', resolved);
    }
  };

  standardFormAction = (action, field, value) => {
    const fields = (typeof field === 'object') && field || {
      [field]: value,
    };

    if (action === 'change') {
      if (field === 'commissionRate' && _try(() => this.props.isCommission)) {
        fields.amount = Utils.calculateCommission(this.props.aggregatedNonCommissionPaymentsTotal, value, this.props.preferences.commissionOffsetPercentage);
      }

      this.props[action](this.state.name, this.state.key, fields);
      this.props.validate(this.state.name, this.state.key, this.validate);
    } else {
      this.props[action](this.state.name, this.state.key, field);
    }
  };

  render() {
    const derived = _try(() => this.props.derived);
    if (!derived) { return null; }

    // Derive State
    const {
      form,
      paymentOptions,
      tagOptions,
      selectedVendor,
      PSOP,
      fee,
    } = derived;
    const isShowing = !!this.props.isShowing;
    return (
      <form className="floating-labels components_forms_payment">
        <div className={`row pt-4 ${!this.props.isShowing && 'hideDisplay'}`}>
          {
            isShowing
            && (
              <div className="col-xs-12 col-md-3">
                <Components.forms.components.maskedinput
                  form={form}
                  maskPlaceholder=""
                  type="string"
                  field="amount"
                  useNumberMask
                  action={this.standardFormAction}
                  label={`Amount${form._values.acceptsVendorFee && ' - less fee' || ''}`}
                  disabled={this.props.creating || this.props.isCommission || this.state.hasLineItems}
                  hideError={_try(() => !form.amount.touched)}
                  required
                  detailedInformation={(form._values.acceptsVendorFee && `+ Fee: ${fee.formatedFeeAmount} = Total: ${fee.formatedNetAmount}`) || (this.state.hasLineItems && 'Sum of line item totals') || null}
                />
              </div>
            )
          }
          {this.props.isCommission && isShowing
            && (
              <div className="col-xs-12 col-md-3">
                <Components.forms.components.maskedinput
                  form={form}
                  maskPlaceholder=""
                  type="string"
                  field="commissionRate"
                  useNumberMask
                  action={this.standardFormAction}
                  label="Commission Percentage"
                  disabled={this.props.creating}
                  hideError={_try(() => !form.commissionRate.touched)}
                  required
                  suffix="%"
                  noPrefix
                  detailedInformation={_try(() => this.props.preferences.commissionOffsetPercentage) && `Commission Offset Percentage: ${this.props.preferences.commissionOffsetPercentage.toString()}%` || null}
                />
              </div>
            )}
          {
            this.props.isShowing
            && (
              <div className="col-xs-12 col-md-3">
                <Components.forms.components.typeahead
                  form={form}
                  field="vendorName"
                  action={this.standardFormAction}
                  label="Vendor"
                  options={Object.values(this.props.selectedVendors || {})}
                  filterBy={(option, value) => {
                    const normalizedValue = Utils.normalizeVendorOrClientName(value);
                    return option.name.startsWith(normalizedValue) || option.name.startsWith(value);
                  }}
                  labelKey="name"
                  noItemsText={'Click to Create Vendor'}
                  noItemsClicked={(e, text) => this.props.openModal('Components.modals.createaccountvendor', { text })}
                  hideError={_try(() => !form.vendorName.touched)}
                  alwaysShowNoItemsOption
                  highlightOnlyResult
                  required
                />
              </div>
            )
          }
          {
            this.props.isShowing
            && (
              <Components.featureFlagWrapper featureKey="clients">
                <div className="col-xs-12 col-md-3">
                  <Components.forms.components.typeahead
                    form={form}
                    field="clientName"
                    action={this.standardFormAction}
                    label="Client"
                    options={Object.values(this.props.clientsData || {})}
                    filterBy={(option, value) => {
                      const normalizedValue = Utils.normalizeVendorOrClientName(value);
                      return option.name.startsWith(normalizedValue) || option.name.startsWith(value);
                    }}
                    labelKey="name"
                    noItemsText={'Click to Create Client'}
                    noItemsClicked={(e, text) => this.props.openModal('Components.modals.createClient', { text })}
                    hideError={_try(() => !form.clientName.touched)}
                    alwaysShowNoItemsOption
                    highlightOnlyResult
                  />
                </div>
              </Components.featureFlagWrapper>
            )
          }
          {_try(() => !!this.props.preferences.globalVendorTagIds.length) && isShowing
            && (
              <div className="col-xs-12 col-md-3">
                <Components.forms.components.selectinput
                  form={form}
                  field="globalVendorTagName"
                  action={this.standardFormAction}
                  label="Vertical"
                  options={tagOptions}
                  placeholder={(selectedVendor.name && !Object.keys(tagOptions).length && 'N/A') || '--'}
                  disabled={this.props.creating || !Object.keys(tagOptions).length}
                  hideError={_try(() => !form.globalVendorTagName.touched)}
                  required={Object.keys(tagOptions).length}
                />
              </div>
            )}
          {
            isShowing
            && (
              <div className="col-xs-12 col-md-3">
                <Components.forms.components.selectinput
                  form={form}
                  field="method"
                  action={this.standardFormAction}
                  label="Payment Method"
                  options={paymentOptions}
                  placeholder={'--'}
                  disabled={this.props.creating || !Object.keys(paymentOptions).length}
                  hideError={_try(() => !Object.keys(paymentOptions).length || !form.method.touched || (this.props.accountVendors[this.state.accountVendorId] && this.props.accountVendors[this.state.accountVendorId].linkedWithPayClearly && this.props.accountVendors[this.state.accountVendorId].hasPSOP === 'no') || (this.props.accountVendors[this.state.accountVendorId] && !this.props.accountVendors[this.state.accountVendorId].readyToPay))}
                  required={Object.keys(paymentOptions).length}
                />
              </div>
            )
          }
          {
            !!_try(() => selectedVendor.needsAttentionNoMethodSelected) && isShowing
            && (
              <div className="col-xs-12 col-md-12">
                <div className="alert alert-warning" role="alert">
                  <div className="d-flex justify-content-between align-items-center">
                    {selectedVendor.name} does not have a defined payment method
                    <button
                      className="btn btn-warning ms-1"
                      onClick={(e, text) => {
                        e.preventDefault();
                        this.props.openModal('Components.modals.updateaccountvendor', { id: selectedVendor.id });
                      }}
                    >
                      Update Vendor
                    </button>
                  </div>
                </div>
              </div>
            )
          }
          {
            !!_try(() => selectedVendor.needsAttentionGlobalVendorInactive) && isShowing
            && (
              <div className="col-xs-12 col-md-12">
                <div className="alert alert-warning" role="alert">
                  <div className="d-flex justify-content-between align-items-center">
                    {`${selectedVendor.name} is linked with an inactive ${this.props.providerTheme.displayName} vendor`}
                    <button
                      className="btn btn-warning ms-1"
                      onClick={(e, text) => {
                        e.preventDefault();
                        this.props.openModal('Components.modals.updateaccountvendor', { id: selectedVendor.id });
                      }}
                    >
                      Update Vendor
                    </button>
                  </div>
                </div>
              </div>
            )
          }
          {
            form._values.method === 'check' && _try(() => selectedVendor.needsAttentionCheckAddressNotValidated) && isShowing
            && (
              <div className="col-xs-12 col-md-12">
                <div className="alert alert-warning" role="alert">
                  <div className="d-flex justify-content-between align-items-center">
                    {`The mailing address for ${selectedVendor.name} has not been validated.`}
                    <button
                      className="btn btn-warning ms-1"
                      onClick={(e, text) => {
                        e.preventDefault();
                        this.props.openModal('Components.modals.addressValidator', { id: selectedVendor.id });
                      }}
                    >
                      Validate Address
                    </button>
                  </div>
                </div>
              </div>
            )
          }
          {
            !!_try(() => selectedVendor.accepts.isNonAcceptor) && isShowing
            && (
              <div className="col-xs-12 col-md-12">
                <div className="alert alert-warning" role="alert">
                  <div className="d-flex justify-content-between align-items-center">
                    {selectedVendor.name} is a non acceptor
                    <button
                      className="btn btn-warning ms-1"
                      onClick={(e, text) => {
                        e.preventDefault();
                        this.props.openModal('Components.modals.updateaccountvendor', { id: selectedVendor.id });
                      }}
                    >
                      Update Vendor
                    </button>
                  </div>
                </div>
              </div>
            )
          }
          {
            !!_try(() => this.props.preferences.requireVendorLinkToERP && selectedVendor.name && !selectedVendor.linkedWithERP) && isShowing
            && (
              <div className="col-xs-12 col-md-12">
                <div className="alert alert-warning" role="alert">
                  <div className="d-flex justify-content-between align-items-center">
                    {selectedVendor.name} is not linked to you ERP/Accounting integration
                    <button
                      className="btn btn-warning ms-1"
                      onClick={(e, text) => {
                        e.preventDefault();
                        this.props.openModal('Components.modals.updateaccountvendor', { id: selectedVendor.id });
                      }}
                    >
                      Update Vendor
                    </button>
                  </div>
                </div>
              </div>
            )
          }
          <div className="col-xs-12 col-md-12">
            <Collapse
              isOpened={form._values.method && (!!Object.keys(_try(() => PSOP.paymentSchema.customFields, {})).length || !!Object.keys(_try(() => this.props.paymentCustomFields, {})).length)}
            >
              <h5 className="box-title mb-3">Additional Payment Information</h5>
              {!!Object.keys(_try(() => this.props.paymentCustomFields, {})).length
                && <Components.forms.custom
                  requireExactMatch={true}
                  fields={this.props.paymentCustomFields}
                  formKey={`customFields-${this.props.formKey || this.state.key}`}
                  initialData={{ ..._try(() => this.props.initialData.fields, {}) }}
                  customValidate={(field, value) => {
                    const sanitizedFieldName = Utils.sanitizeString(field.name || '');
                    switch (sanitizedFieldName) {
                      case 'checknumber':
                        if (form._values.method === 'check') {
                          const checkNumbers = this.props.checkNumbers || {};
                          if (checkNumbers[value.toString()]) {
                            return 'This check number has already been used';
                          }
                          if (value.toString().length > 10 || !value.toString().split('').every((char) => '0123456789'.includes(char))) {
                            return 'Check number must be a 1-10 digit number';
                          }
                          return _try(() => this.props.uploadCheckNumbers[value.toString()] > 1) ? 'This check number is assigned to another payment in this batch' : false;
                        }
                        break;
                      default:
                        break;
                    }
                    return false;
                  }}
                  validationTrigger={`${form._values.method}${_try(() => this.props.uploadCheckNumbers[this.props.customFormValues[Object.keys(this.props.customFormsValues).find((key) => Utils.sanitizeString(key) === 'checknumber')].toString()], 0)}`}
                  blurOnInit
                  isShowing={isShowing}
                />}
              {!!Object.keys(_try(() => PSOP.paymentSchema.customFields, {})).length
                && <Components.forms.custom
                  fields={_try(() => PSOP.paymentSchema.customFields)}
                  formKey={`paymentFields-${this.props.formKey || this.state.key}`}
                  initialData={{ ..._try(() => this.props.initialData.fields, {}) }}
                  blurOnInit
                  isShowing={isShowing}
                />}
            </Collapse>
          </div>
          {
            isShowing
            && (
              <div className="col-xs-12 col-md-12">
                <Collapse
                  isOpened={!!_try(() => form._values.method && Object.keys(PSOP.credentialSchema._id))}
                >
                  {!!_try(() => form._values.method && Object.keys(PSOP.credentialSchema._id))
                    && (
                      <div className="card">
                        {!derived.credentialsAreValid
                          && <div className="alert alert-warning" role="alert">
                            <div className="d-flex justify-content-between align-items-center">
                              {selectedVendor.name} requires information in order be be paid via {paymentOptions[form._values.method].display}
                            </div>
                          </div>}
                        {form._values.clientName
                          && (
                            <Fragment>
                              {_try(() => this.props.clientsCollections.names[form._values.clientName])
                                ? <Components.entities.clientVendorLink
                                  id={_try(() => this.props.clientVendorLinksCollectionsIds[`${this.props.clientsData[this.props.clientsCollections.names[form._values.clientName][0]]._id}${clientVendorLinkIdSeparator}${this.props.accountVendorNamesToIds[form._values.vendorName]}`][0], `${this.props.clientsData[this.props.clientsCollections.names[form._values.clientName][0]]._id}${clientVendorLinkIdSeparator}${this.props.accountVendorNamesToIds[form._values.vendorName]}`)}
                                  clientId={_try(() => this.props.clientsData[this.props.clientsCollections.names[form._values.clientName][0]]._id)}
                                  vendorId={_try(() => this.props.accountVendorNamesToIds[form._values.vendorName])}
                                />
                                : <div className="pe-3 ps-3 pb-3">
                                  <span>Please select a valid client or remove client reference to continue</span>
                                </div>}
                            </Fragment>
                          )}
                        {!form._values.clientName
                          && <Components.entities.accountvendorcredentials id={PSOP.credentialSchema._id} />}
                      </div>
                    )}
                  <br />
                </Collapse>
              </div>
            )
          }
          {
            isShowing
            && (
              <div className="col-xs-12 col-md-12">
                <Collapse
                  isOpened={!!_try(() => form._values.method && PSOP.fee.type)}
                >
                  <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">Service Fee Required</h4>
                    <div>
                      {`${selectedVendor.name} charges a service fee for credit card payments. For your payment of ${fee.formatedAmount}, an additional service fee of ${fee.formatedFeeAmount} will be added, for a grand total of ${fee.formatedNetAmount}. Please indicate that you accept the addition of the service fee to the payment total.`}
                    </div>
                    <Components.forms.components.checkbox
                      form={form}
                      field="acceptsVendorFee"
                      action={this.standardFormAction}
                      label="I Accept the Service Fee"
                      disabled={this.props.disabled}
                      required
                    />
                  </div>
                  <br />
                </Collapse>
              </div>
            )
          }
          {form._values.method && isShowing
            && (
              <div className="col-xs-12 col-md-12">
                <Components.forms.components.accordion
                  showLabel="Show Delivery Options"
                  hideLabel="Hide Delivery Options"
                  showDanger={form.repEmails.error || form.vCardEmails.error || form.vCardFaxNumbers.error}
                  // PC-3495 management team decided to increase Galileo vCard maxUses to 5 and block email warning text
                  warningText={form._values.method === 'vCard' && this.props.provider !== 'GALILEO' && form._values.vCardUsageLimit > 1 && 'Delivery emails or fax numbers not available for multi-use cards' || ''}
                  leftAligned
                >
                  <div className="row py-4">
                    <div className="col-xs-12 col-md-4">
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
                    {
                      form._values.method === 'vCard' && _try(() => !(form._values.vCardUsageLimit > 1)) && _try(() => !selectedVendor.linkedWithPayClearly)
                      && (
                        <Fragment>
                          <div className="col-xs-12 col-md-4">
                            <Components.forms.components.textinput
                              form={form}
                              field="vCardEmails"
                              action={this.standardFormAction}
                              label="Virtual Card Delivery Email"
                              hideError={!form.vCardEmails.touched}
                              disabled={this.props.creating}
                            />
                          </div>
                          <div className="col-xs-12 col-md-4">
                            <Components.forms.components.textinput
                              form={form}
                              field="vCardFaxNumbers"
                              action={this.standardFormAction}
                              label="Virtual Card Delivery Fax Number"
                              hideError={!form.vCardFaxNumbers.touched}
                              disabled={this.props.creating}
                            />
                          </div>
                        </Fragment>
                      )
                    }
                  </div>
                </Components.forms.components.accordion>
              </div>
            )}
          {form._values.method && this.props.erpIntegrationLinked
            && (
              <div className="col-xs-12 col-md-12">
                <Components.forms.components.accordion
                  showLabel="Show ERP/Accounting Options"
                  hideLabel="Hide ERP/Accounting Options"
                  leftAligned
                >
                  <Components.forms.erpFields
                    hideTypeAheads={!this.props.isShowing}
                    formKey={`erpFields-${this.props.formKey || this.state.key}`}
                    initialData={{ ..._try(() => this.props.initialData.fields, {}) }}
                    isShowing={isShowing}
                  />
                </Components.forms.components.accordion>
              </div>
            )}
          {
            form._values.method === 'vCard'
            && _try(() => !selectedVendor.linkedWithPayClearly)
            && isShowing
            && (
              <div className="col-xs-12 col-md-12">
                <Components.forms.components.accordion
                  showLabel="Show Additional Card Payment Options"
                  hideLabel="Hide Additional Card Payment Options"
                  leftAligned
                >
                  <h5 className="box-title pt-4">Modify Card Options</h5>
                  <div className="row pt-2">
                    <div className="col-xs-12 col-md-4">
                      <Components.forms.components.textinput
                        form={form}
                        type="number"
                        field="vCardUsageLimit"
                        action={this.standardFormAction}
                        label="Max Uses"
                        disabled={this.props.creating}
                        hideError={!form.vCardUsageLimit.touched}
                      />
                    </div>
                    <div className="col-xs-12 col-md-4">
                      <Components.forms.components.selectinput
                        form={form}
                        field="vCardRegion"
                        action={this.standardFormAction}
                        label="Region"
                        options={REGION_OPTIONS}
                        placeholder={REGION_OPTIONS[form.vCardRegion.value].display}
                        disabled={this.props.disabled}
                      />
                    </div>
                    <div className="col-xs-12 col-md-4">
                      <Components.forms.components.switch
                        form={form}
                        field="vCardRequireExactMatch"
                        action={this.standardFormAction}
                        label="Requires Exact Match"
                        disabled={this.props.disabled || _try(() => form._values.vCardUsageLimit > 1)}
                      />
                    </div>
                    <div className="col-xs-12 col-md-4">
                      <Components.forms.components.daypicker
                        dateRange={{ min: (new Date()), max: Utils.dates.plusThreeYearsMinusOneDay(Date.now()) }}
                        form={form}
                        type="number"
                        field="vCardValidThrough"
                        action={this.standardFormAction}
                        label="Valid Through"
                        disabled={this.props.disabled}
                      />
                    </div>
                  </div>
                </Components.forms.components.accordion>
              </div>
            )
          }
          {
            _try(() => !!form._values.method && this.state.hasLineItems)
            && (
              <div className="col-12">
                <div className="card card-with-label p-0">
                  <p className="card-label px-1"><strong>Line Items</strong></p>
                  <div className="card-body p-0 pb-2 line-item-card-body">
                    <div className="d-flex justify-content-between align-items-center px-4 pt-3 pb-2">
                      <div>
                        <span>
                          <span className="text-primary">
                            <i className="mdi mdi-currency-usd pe-2" />
                          </span>
                          <strong>{this.props.lineItemsMeta.count}</strong> Line Items:&nbsp;&nbsp;
                        </span>
                      </div>
                      <div>
                        <strong>{numeral(derived.lineItemTotal).format('$0,0.00')}</strong>
                      </div>
                    </div>
                    <hr className="m-0" />
                    <div className="px-4">
                      <Components.button
                        buttonText="Add Line Item"
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextId = this.props.lineItemsMeta.maxId + 1;
                          const fields = ['date', 'invoice', 'description', 'balance', 'discount', 'amount'].reduce((acc, field) => {
                            acc[`lineItem_${nextId}_${field}`] = '';
                            return acc;
                          }, {});
                          this.props.addFields('Components.forms.lineItems', this.props.formKey || this.state.key, fields);

                          // set table pagination correctly
                          const { lineItemTable, lineItemsMeta } = this.props;
                          const { rowsPerPage } = lineItemTable.pagination || {};
                          const itemCount = lineItemsMeta.count;
                          // extra page buffer checks if we are about to add the first item on a new page
                          const extraPageBuffer = itemCount % rowsPerPage === 0 ? 1 : 0;
                          const lastPage = Math.ceil(itemCount / rowsPerPage) - 1 + extraPageBuffer;
                          this.props.changePagination('Components.forms.lineItems', this.props.formKey, { currentPage: lastPage });

                          // reset any active table filters
                          this.props.resetTableFilters('Components.forms.lineItems', this.props.formKey || this.state.key);
                        }}
                        className="btn btn-primary add-line-item-button"
                        ariaLabel="Add Line Item"
                        icon="mdi mdi-plus-circle text-white"
                        iconLeft
                      />
                      {!_resolve(this.props.lineItemsMeta, 'form._allValid')
                        && (
                          <div className="py-2">
                            <div className="alert alert-danger m-0" role="alert">
                              Some line items are not ready. The status filter can locate these items.
                            </div>
                          </div>
                        )}
                      <Components.tables.components.multiFilter
                        tableName="Components.forms.lineItems"
                        tableKey={this.props.formKey || this.state.key}
                        filterConfig={lineItemFilterConfig.multiFilter}
                        hideHeader
                      />
                    </div>
                    <Components.forms.lineItems
                      initialData={this.props.initialData.lineItems}
                      formKey={this.props.formKey || this.state.key}
                      isShowing={isShowing}
                    />
                  </div>
                </div>
              </div>
            )
          }
        </div>
      </form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_forms_payment);

// Private Helpers
const REGION_OPTIONS = {
  USA: {
    display: 'United States',
  },
  CAN: {
    display: 'Canada',
  },
  USC: {
    display: 'USA and Canada',
  },
  INT: {
    display: 'International',
  },
  NAM: {
    display: 'North America',
  },
};

function _findOption(options, value) {

  const optionBasedOnDisplay = Object.keys(options)
    .find((key) => _fuzzyMatch(value, options[key].display));

  const optionBasedOnKey = Object.keys(options)
    .find((key) => _fuzzyMatch(value, key));

  return optionBasedOnDisplay || optionBasedOnKey || null;

  function _fuzzyMatch(val, val2) {
    // TODO add even more match cases here.
    return (val || '').toLowerCase() === (val2 || '').toLowerCase();
  }

}


const clientVendorLinkIdSeparator = '-';

function convertToBoolean(str) {
  if (typeof str === 'string' && str.toLowerCase() === 'true') {
    return true;
  }
  return false;
}



