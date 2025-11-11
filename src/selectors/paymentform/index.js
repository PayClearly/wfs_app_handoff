// Third Party Imports ...

import Utils from 'utils';
import Selectors from 'selectors';

const selectors_paymentform = (key) => Utils.cachedSelector(
  'selectors_paymentform',
  key,
  (state) => state.forms['Components.forms.payment'][key],
  (state) => !!state.forms['Components.forms.custom'][`paymentFields-${key}`]._allValid,
  (state) => state.forms['Components.forms.custom'][`paymentFields-${key}`]._values,
  (state) => !!state.forms['Components.forms.custom'][`customFields-${key}`]._allValid,
  (state) => state.forms['Components.forms.custom'][`customFields-${key}`]._values,
  (state) => state.forms['Components.forms.erpFields'][`erpFields-${key}`]._values,
  (state) => state.forms['Components.forms.erpFields']['erpFields-override']._values,
  (state) => Selectors.accountVendors(state).active,
  (state) => Selectors.accountVendorNamesToIds(state),
  (state) => state.account.clients.data.items,
  (state) => state.account.clients.collections,
  (state) => state.account.clientVendorLinks.data.items,
  (state) => state.account.clientVendorLinks.collections,
  (state) => state.account.paymentPipelinePreferences.data.item,
  (state) => Selectors.uploadLineItems(key)(state),
  (state) => state.forms['Components.forms.scheduler'].default,
  (
    form,
    paymentFieldsFormValid = true,
    paymentFieldsFormValues = {},
    customFieldsFormValid = true,
    customFieldsFormValues,
    erpFields = {},
    erpOverrides = {},
    selectedVendors,
    accountVendorNamesToIds,
    clientsData = {},
    clientsCollections = {},
    clientVendorLinksData = {},
    clientVendorLinksCollections = {},
    paymentPipelinePreferences = {},
    lineItems = { form: { _allValid: true } },
    schedulerForm
  ) => {

    if (!form) { return null; }
    const populatedErpOverrides = Object.keys(erpOverrides || {}).reduce((acc, cur) => {
      if (erpOverrides[cur]) { acc[cur] = erpOverrides[cur]; }
      return acc;
    }, {});
    const erpValues = { ...erpFields, ...populatedErpOverrides };

    // Derive State
    const selectedVendor = selectedVendors[accountVendorNamesToIds[form._values.vendorName]] || {};
    const selectedTag = (selectedVendor?.selectableTags || {})[form?._values?.globalVendorTagName] || {};

    const tagOptions = selectedVendor.selectableTags || {};
    const paymentOptions = _try(() => selectedVendor.tagsToPaymentMethodOptions[selectedTag && selectedTag.id] || selectedVendor.tagsToPaymentMethodOptions.unlinked || {}, {});

    const isCommission = form?._values?.isCommission;
    let commission;
    if (isCommission) {
      const commissionRate = _try(() => parseFloat(form._values.commissionRate));
      const commissionOffsetPercentage = paymentPipelinePreferences?.commissionOffsetPercentage || 100;

      commission = {
        isCommission,
        commissionRate,
        commissionOffsetPercentage,
      };
    }

    const PSOP = _try(() => (selectedVendor.tags[selectedTag && selectedTag.id] || selectedVendor.tags.unlinked || {})[form._values.method] || {}, {});
    const fee = _try(() => PSOP.feeFactory(form._values.amount), {});
    const vCardTransactions = fee?.transactions;
    const lineItemTotal = Utils.addDollars(Object.keys(lineItems.data || {}).map((lineItemKey) => lineItems.data[lineItemKey].amount));

    // Clients
    const selectedClient = clientsData?.[clientsCollections?.names?.[form?._values?.clientName]?.[0]] || {};
    const isMissingClient = Boolean(form._values.clientName && !selectedClient?._id);

    // Credentials Validation
    let credentialsAreValid;
    // TODO NEDIM: make sure we implement fallback to account level creds logic if applicable
    if (selectedClient._id && selectedVendor._id) {
      credentialsAreValid = Utils.isSchemaValid(
        PSOP?.credentialSchema?.fields,
        clientVendorLinksData?.[clientVendorLinksCollections?._ids?.[`${selectedClient?._id}${clientVendorLinkIdSeparator}${selectedVendor?._id}`]?.[0]]?.credentials || {}
      );
    } else {
      credentialsAreValid = PSOP.accountCredsValid;
    }

    // Data that may be sent to the api
    const adapted = _adaptToCreatable(
      { ...form._values, ...erpValues },
      selectedVendor,
      selectedTag,
      selectedClient,
      customFieldsFormValues,
      paymentFieldsFormValues,
      fee,
      commission,
      lineItems,
      schedulerForm
    );

    return {
      form,
      formKey: key,
      tagOptions,
      paymentOptions,
      selectedVendor,
      selectedClient,
      PSOP,
      credentialsAreValid,
      fee,
      paymentFieldsFormValid,
      customFieldsFormValid,
      valid: (
        form._allValid
        && customFieldsFormValid
        && paymentFieldsFormValid
        && !!credentialsAreValid
        && !!lineItems.form._allValid
        && !isMissingClient
      ),
      adapted: {
        ...adapted,
        ...(vCardTransactions ? { transactionAmounts: vCardTransactions } : {})
      },
      commission,
      lineItemTotal,
    };
  }
);

export default selectors_paymentform;

// Internal Helper Functions ...
const _adaptToCreatable = (
  values, selectedVendor,
  selectedTag,
  selectedClient,
  customFieldsFormValues,
  paymentFieldsFormValues,
  fee,
  commission,
  lineItems = {},
  schedulerForm = {}
) => {

  const { feeAmount = 0 } = fee;

  return {
    vendorId: selectedVendor._id,
    amount: Utils.addDollars([feeAmount, values.amount || 0]),
    netAmount: Utils.addDollars([values.amount]),
    method: values.method,
    erpVendor: values.erpVendor || null,
    erpClass: values.erpClass || null,
    erpAccount: values.erpAccount || null,
    erpCategory: values.erpCategory || null,
    options: {
      vCard: {
        maxUses: (values.vCardUsageLimit && _try(() => parseInt(values.vCardUsageLimit, 10))) || null,
        region: values.vCardRegion || null,
        exactMatch: values.vCardRequireExactMatch,
        validThrough: values.vCardValidThrough && _timeToData(values.vCardValidThrough) || null,
      },
      repEmails: (values?.repEmails?.length && values?.repEmails) || null,
      vCardEmails: (values?.vCardEmails?.length && values?.vCardEmails?.split(',')) || null,
      vCardFaxNumbers: (values?.vCardFaxNumbers?.length && values?.vCardFaxNumbers?.split(',')) || null,
      isCommission: commission?.isCommission || null,
      commissionRate: commission?.isCommission ? commission?.commissionRate : null,
      commissionOffsetPercentage: commission?.isCommission ? commission?.commissionOffsetPercentage : null,
    },
    paymentFields: paymentFieldsFormValues || {},
    customFields: customFieldsFormValues || {},
    globalVendorId: selectedVendor.linkedWithPayClearlyVendorId,
    globalVendorTagId: selectedTag.id,
    globalVendorTagAlias: (values.globalVendorTagName !== selectedTag.name) && values.globalVendorTagName || null,
    payAt: _try(() => schedulerForm._values.time.getTime(), null),
    fee: feeAmount,
    invoiceId: values.invoiceId || null,
    lineItems: Object.keys(lineItems.data || {}).map((lineItemKey) => {
      const lineItem = lineItems.data[lineItemKey];
      return {
        date: lineItem.date || null,
        invoice: lineItem.invoice || null,
        description: lineItem.description || null,
        balance: !lineItem.balance && typeof lineItem.balance !== 'number' ? null : Utils.convertToAmount(lineItem.balance),
        discount: !lineItem.discount && typeof lineItem.discount !== 'number' ? null : Utils.convertToAmount(lineItem.discount),
        amount: !lineItem.amount && typeof lineItem.amount !== 'number' ? null : Utils.convertToAmount(lineItem.amount),
      };
    }),
    clientId: selectedClient._id || null,
    overrideFeeRules: values.overrideFeeRules,
  };
};

const _timeToData = (time) => {
  let toReturn = time;
  if (!toReturn) {
    const plusTwoWeeks = new Date();
    plusTwoWeeks.setDate(plusTwoWeeks.getDate() + 30);
    toReturn = plusTwoWeeks;
  }
  // sets date to noon UTC and returns epoch in milliseconds
  const noonUTC = new Date(toReturn);
  noonUTC.setUTCHours(12, 0, 0, 0);
  const toReturnEpochMilliseconds = noonUTC.getTime();
  return toReturnEpochMilliseconds;
};

const clientVendorLinkIdSeparator = '-';

