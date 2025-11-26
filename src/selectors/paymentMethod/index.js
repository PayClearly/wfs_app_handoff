import createSelector from 'selector';
import Constants from '../../constants';

const selectors_paymentMethod = createSelector('selectors_paymentMethod',

  state => state.account.paymentStatuses.data.items,
  state => state.global.vendors.data.items,
  state => state.global.groups.data.items,
  state => state.global.paymentProcedures.data.items,
  state => state.user,

  (paymentStatuses = {}, globalVendors = {}, groups = {}, paymentProcedures = {}, user = {}) => {
    if (!user || !user.privileges.data.item.rootLevel || !user.privileges.data.item.rootLevel.administrateGlobalVendors) {
      return {};
    }

    const paymentMethodsById = {};

    // Sorting order is Phone > Fax > Email > Portal
    Object.keys(paymentStatuses).forEach((paymentId) => {

      const globalVendorId = paymentStatuses[paymentId] && paymentStatuses[paymentId].verified
        && paymentStatuses[paymentId].verified.vendor
        && paymentStatuses[paymentId].verified.vendor.globalVendorRef 
        && paymentStatuses[paymentId].verified.vendor.globalVendorRef.split('/')[1];

      const groupId = globalVendors[globalVendorId] && globalVendors[globalVendorId].groupId;
      const paymentProcedureId = groups[groupId] && groups[groupId].vCard.credentialSchema;
      const paymentProcedure = paymentProcedures[paymentProcedureId];

      // Is a PSOP payment method is manual, determine whether it's a phone or portal method. 
      if (paymentProcedure && paymentProcedure.vCardDeliveryMethod === 'manual') {
        // Regex will match most phone number formats
        const isPhone = !!paymentProcedure.notes.match(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/);

        paymentMethodsById[paymentId] = (isPhone) ? { display: 'Phone', order: 4 } : { display: 'Portal', order: 1 };

      } else {
        paymentMethodsById[paymentId] = { display: 'Unknown', order: 0 };

        if (paymentProcedure && paymentProcedure.vCardDeliveryMethod === 'fax') {
          paymentMethodsById[paymentId] = { display: 'Fax', order: 3 };
        }
        if (paymentProcedure && paymentProcedure.vCardDeliveryMethod === 'email') {
          paymentMethodsById[paymentId] = { display: 'Email', order: 2 };
        }
        if (paymentProcedure && (paymentProcedure.vCardDeliveryMethod === 'automation' || paymentProcedure.vCardDeliveryMethod === Constants.AUTOMATION_TAIKO)) {
          paymentMethodsById[paymentId] = { display: 'Automation', order: 1 };
        }
      }

    });

    return paymentMethodsById;
  }
);

export default selectors_paymentMethod;
