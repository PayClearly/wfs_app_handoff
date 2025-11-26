import numeral from 'numeral';
import createSelector from 'selector';

// Third Party Imports ...

import Utils from 'utils';
import Selectors from 'selectors';
import Constants from '../../constants';
import getPaymentFeeAmounts from './utils';

const selectors_accountVendors = createSelector(

  (state) => state.global.procedures.data.items,
  (state) => state.account.accountVendors.data.items,
  (state) => state.account.accountVendorCredentials.data.items,
  (state) => state.account.erpIntegration.data.resources,
  (state) => state.account.paymentPipelinePreferences.data.item,
  (state) => Selectors.globalTaggedItems(state),
  (state) => Selectors.integrations(state),
  (
    procedures = {},
    accountVendors = {},
    accountVendorCredentials = {},
    erpResources = {},
    preferences = {},
    globalTaggedItems = {},
    integrations = {}
  ) => {
    if (!globalTaggedItems.allTagsLoaded) {
      return { all: {}, active: {} };
    }

    const active = {};
    const all = Object.keys(accountVendors).reduce((acc, key) => {
      const vendor = accountVendors[key];
      const integrated = {
        vCard: !!integrations?.cardsIntegration?.linked,
        ACH: !!integrations?.achIntegration?.linked,
        check: !!integrations?.checksIntegration?.linked,
      };
      const allowPCToHandle = {
        vCard: true,
        ACH: true,
        check: false,
      };
      const selectedVendor = {
        name: vendor.name,
        displayName: vendor.displayName || '',
        display: (vendor.displayName && vendor.displayName !== vendor.name && `${vendor.displayName} (${vendor.name})`) || vendor.name,
        active: vendor.active,
        id: vendor._id,
        _id: vendor._id,
        createdAt: vendor._createdAt ? new Date(vendor._createdAt).toLocaleDateString().split(',')[0] : 'unknown',
        timestampAdded: vendor._createdAt,
        lastModifiedAt: vendor._lastModifiedAt ? new Date(vendor._lastModifiedAt).toLocaleDateString().split(',')[0] : 'unknown',
        timestampModified: vendor._lastModifiedAt,

        // Contact details
        contactName: vendor.contactName || null,
        contactEmail: vendor.contactEmail || null,
        contactPhoneNumber: vendor.contactPhoneNumber || null,
        contactFaxNumber: vendor.contactFaxNumber || null,
        notes: vendor.notes || null,

        // Delivery Options
        repEmails: vendor.repEmails || [],
        vCardEmails: !vendor.globalVendorRef && vendor.vCardEmails || [],
        vCardFaxNumbers: !vendor.globalVendorRef && vendor.vCardFaxNumbers || [],
        vCardFee: vendor.vCardFee || null,
        vCardPaymentLimit: vendor.vCardPaymentLimit || null,
        vCardDefaultMaxUses: vendor.vCardDefaultMaxUses || null, // WEX only
        providerVCardDefaultMaxUses: vendor.providerVCardDefaultMaxUses || null,
        checkAddressLine1: vendor.checkAddressLine1,
        checkAddressLine2: vendor.checkAddressLine2,
        checkAddressLine3: vendor.checkAddressLine3,
        checkCity: vendor.checkCity,
        checkStateProv: vendor.checkStateProv,
        checkPostalCode: vendor.checkPostalCode,
        checkCountry: vendor.checkCountry,
        checkAddressValidated: vendor.checkAddressValidated,
        checkAddressUserForceValidated: vendor.checkAddressUserForceValidated,

        // Global Vendor Link
        linkedWithPayClearly: !!vendor.globalVendorRef,
        linkedWithPayClearlyVendorId: vendor.globalVendorRef,
        linkedWithPayClearlyName: !!vendor?.globalVendorRef && globalTaggedItems?.vendors?.[vendor?.globalVendorRef]?.name || '',
        linkedWithPayClearlyActiveVendor: !!vendor?.globalVendorRef && !!globalTaggedItems?.vendors?.[vendor?.globalVendorRef]?.active || '',

        // ERP Link
        erpVendor: vendor.erpVendor,
        erpClass: vendor.erpClass,
        erpCategory: vendor.erpCategory,
        erpAccount: vendor.erpAccount,
        erpVendorText: erpResources?.vendors?.[vendor?.erpVendor]?.name || false,
        erpClassText: erpResources?.classes?.[vendor?.erpClass]?.name || false,
        erpCategoryText: erpResources?.categories?.[vendor?.erpCategory]?.name || false,
        erpAccountText: erpResources?.accounts?.[vendor?.erpAccount]?.name || false,
        linkedWithERP: erpResources?.vendors?.[vendor?.erpVendor]?.name || false,

        tags: !vendor.globalVendorRef ? _unlinkedTagData(vendor, integrated) : _linkedTagData(vendor, accountVendorCredentials, globalTaggedItems, integrated, allowPCToHandle, procedures),
        selectableTags: vendor?.globalVendorRef && globalTaggedItems?.vendors?.[vendor?.globalVendorRef]?.selectableTags || {},
        selfServe: {
          vCard: !integrated.vCard,
          ACH: !integrated.ACH,
          check: !integrated.check,
        },
      };

      //
      selectedVendor.accepts = _acceptsAtAll(selectedVendor);
      selectedVendor.accepts.isNonAcceptor = selectedVendor.linkedWithPayClearly && !Object.keys(selectedVendor.accepts).some((method) => selectedVendor.accepts[method] === true);
      selectedVendor.tagsToPaymentMethodOptions = _selectablePaymentMethods(selectedVendor);
      selectedVendor.readyToPay = { vCard: true, ACH: true, check: false }; // TODO

      // Issues
      selectedVendor.needsAttentionNoMethodSelected = !selectedVendor?.linkedWithPayClearly && !(selectedVendor?.accepts?.vCard || selectedVendor?.accepts?.ACH || selectedVendor?.accepts?.check) || false;
      selectedVendor.needsAttentionNeedsERPLink = preferences?.requireVendorLinkToERP && !selectedVendor?.linkedWithERP || false;
      selectedVendor.needsAttentionGlobalVendorInactive = selectedVendor?.linkedWithPayClearly && !selectedVendor?.linkedWithPayClearlyActiveVendor || false;
      selectedVendor.needsAttentionCheckAddressNotValidated = selectedVendor?.accepts?.check && integrated?.check && !selectedVendor?.checkAddressValidated && !selectedVendor?.checkAddressUserForceValidated || false;
      selectedVendor.needsAttention = Object.keys(selectedVendor).filter((k) => k.includes('needsAttention')).some((k) => selectedVendor[k]);

      selectedVendor.accepts.checkAlert = selectedVendor.needsAttentionCheckAddressNotValidated;

      // Tag Display
      if (vendor.active) {
        active[key] = selectedVendor;
      }

      acc[key] = selectedVendor;
      return acc;

    }, {});

    return {
      active,
      all,
    };
  }

);

export default selectors_accountVendors;

// Internal Helper Functions ...

const _accountVendorProcedureFactory = (vendor, method, integrations) => {
  // Need to build PSOP components since account level vendors don't have explicit PSOPs
  const fee = vendor[`${method}Fee`] || {};
  return {
    ...blankPSOP,
    accepts: vendor[method],
    accountCredsValid: true,
    fee,
    feeFactory: _feeFactory(fee),
    readyToPay: _configuredForPaymentMethod(method),
    selfServe: !integrations[method],
  };
};

const _globalVendorProcedureFactory = (vendor, method, integrations, PSOP, credentialSchema, accountVendorCredential, procedure) => ({
  ...(PSOP || blankPSOP),
  accountCredsValid: Utils.isSchemaValid(credentialSchema.fields, accountVendorCredential.fields),
  feeFactory: _feeFactory(PSOP.fee, procedure),
  readyToPay: _configuredForPaymentMethod(method),
  selfServe: !integrations[method],
});

function _unlinkedTagData(vendor, integrations) {
  return {
    unlinked: ['vCard', 'ACH', 'check'].reduce((acc, method) => {
      acc[method] = _accountVendorProcedureFactory(vendor, method, integrations);
      return acc;
    }, {}),
  };
}

function _linkedTagData(vendor, accountVendorCredentials, globalTaggedItems, integrations, allowPCToHandle, procedures) {
  const globalVendor = globalTaggedItems.vendors[vendor.globalVendorRef];
  return Object.keys((globalVendor && globalVendor.tags) || {})
    .reduce((bcc, tagId) => {
      bcc[tagId] = ['vCard', 'ACH', 'check']
        .reduce((acc, method) => {
          const PSOP = globalVendor.tags[tagId][method];
          const procedure = (
            PSOP
            && PSOP.procedure
            && procedures[PSOP.procedure]
          );
          const { credentialSchema } = PSOP;
          const accountVendorCredential = accountVendorCredentials[credentialSchema._id] || {};

          if ((integrations[method] && allowPCToHandle[method]) || !integrations[method]) {
            acc[method] = _globalVendorProcedureFactory(vendor, method, integrations, PSOP, credentialSchema, accountVendorCredential, procedure);
          } else if (integrations[method] && !allowPCToHandle[method]) {
            acc[method] = _accountVendorProcedureFactory(vendor, method, integrations);
          }
          return acc;

        }, {});
      return bcc;
    }, {});
}

function _configuredForPaymentMethod(methdo) {
  // TODO
  return true;
}

function _selectablePaymentMethods(vendor) {
  return Object.keys(vendor.tags || {})
    .reduce((acc, tagId) => {
      acc[tagId] = Object.keys(vendor.tags[tagId])
        .reduce((bcc, method) => {
          const PSOP = vendor.tags[tagId];
          if (!PSOP[method].accepts) { return bcc; }
          const methods = { vCard: 'Card', ACH: 'ACH', check: 'Check' };
          bcc[method] = {
            display: methods[method] || method,
          };
          return bcc;
        }, {});
      return acc;
    }, {});
}

function _acceptsAtAll(vendor) {
  return Object.keys(vendor.tags || {})
    .reduce((acc, tagId) => ({
      ...acc,
      vCard: acc.vCard || vendor?.tags?.[tagId]?.vCard?.accepts,
      ACH: acc.ACH || vendor?.tags?.[tagId]?.ACH?.accepts,
      check: acc.check || vendor?.tags?.[tagId]?.check?.accepts,
    }), { vCard: false, ACH: false, check: false });
}

function _feeFactory(fee = {}, procedure = {}) {
  return (inputAmount) => {
    // make sure amount is a number, not string
    const amount = Utils.addDollars([inputAmount]);

    const { vCardMaxPerCardAmount, vCardRequireUniqueAmounts } = procedure;

    /**
     * The maximum vCard amount was changed from $990,000 to $500,000 therefore
     * we need to guard against legacy procedures that might have a max amount greater than $500,000
     */
    let vCardMaxPerCardAmountWithGuard = Constants.VCARD_MAX_AMOUNT;

    if (vCardMaxPerCardAmount) {
      vCardMaxPerCardAmountWithGuard = Math.min(vCardMaxPerCardAmount, Constants.VCARD_MAX_AMOUNT);
    }

    const { totalAmount, totalFeeAmount, transactions } = getPaymentFeeAmounts({
      maxTransactionAmount: vCardMaxPerCardAmountWithGuard,
      netPaymentAmount: amount,
      fee,
      requireUniqueAmounts: vCardRequireUniqueAmounts,
    });

    return {
      /**
       * "amount" is "inputAmount" which is the base payment amount.
       * We also refer to this as the "netAmount" of the payment.
       */
      amount,
      feeAmount: totalFeeAmount,
      transactions,
      /**
       * Net amount previously was inputAmount + feeAmount. Not sure
       * why it is labeled "netAmount," but it corresponds to the
       * total amount of the payment including the fee.
       */
      netAmount: totalAmount,

      formatedAmount: numeral(amount).format('$0,0.00'),
      formatedFeeAmount: numeral(totalFeeAmount).format('$0,0.00'),
      formatedNetAmount: numeral(totalAmount).format('$0,0.00'),

      type: fee.type || false,
    };
  };
}

const blankPSOP = {
  // PSOP
  accepts: false,
  fee: {},
  paymentSchema: {},
  credentialSchema: {},
  accountCredentialSchema: {},

  // Linked with account data
  readyToPay: false,
};
