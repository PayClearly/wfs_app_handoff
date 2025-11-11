/**
* @typedef {(number|null)} BotErrors
*/

import createSelector from 'selector';
import Utils from 'utils';
import Selectors from 'selectors';
import Constants from '../../constants';

// Third Party Imports ...


const selectors_csrPaymentsTableData = createSelector(
'selectors_csrPaymentsTableData',
  (state) => state.account.paymentStatuses.data.items,
  (state) => state.account.accountBalances.data.item.paymentsWithDeliveryIssues,
  (state) => state.account.accountBalances.data.item.paymentsWithCardExpiringSoon,
  (state) => Selectors.paymentIssues(state).pendingPaymentIssues,
  (state) => state.account.accountVendors.data.items,
  (state) => Selectors.opsNotesDenormalized(state),
  (state) => Selectors.context(state),
  (state) => state.account.cardsIntegration.data.resources.vCards,
  (state) => state.global.vendors.data.items,
  (state) => state.global.groups.data.items,
  (state) => state.global.procedures.data.items,
  (state) => state.global.tags.data.items,

  (paymentStatuses = {}, paymentsWithDeliveryIssues = [], paymentsWithCardExpiringSoon = [], _pendingPaymentIssues = {}, vendors = {}, _opsNotes = {}, context = {}, vCards = {}, globalVendors = {}, globalGroups = {}, procedures = {}, tags = {}) => Object.keys(paymentStatuses)
    .reduce((acc, id) => {
      const paymentStatus = paymentStatuses[id];
      const globalVendorId = _resolve(paymentStatus, 'created.globalVendorId');
      const globalTagId = _resolve(paymentStatus, 'created.globalVendorTagId');
      let paymentProcedure = {};
      let groupName = '';
      let tagName = '';
        if (globalVendorId && globalTagId) {
          const method = _resolve(paymentStatus, 'created.method');

          const globalVendor = globalVendors[globalVendorId];
          const groupIds = globalVendor && globalVendor.groupIds || [];
          const vendorPSOP = getVendorPSOP(globalTagId, method, groupIds, globalGroups) || {};

          paymentProcedure = procedures[vendorPSOP.procedureId] || {};

          groupName = vendorPSOP.groupName;
          tagName = tags[globalTagId] && tags[globalTagId].name || '';
      }

      const cardLast4s = paymentStatus.funded && paymentStatus.funded.vCards && paymentStatus.funded.vCards.reduce((_acc, cur) => {
        const vCard = vCards[cur.id] || {};
        _acc += `${vCard.cardNumberLastFour}, `;
        return _acc;
      }, '') || '';

      const deliveryIssue = Boolean(paymentsWithDeliveryIssues.indexOf && paymentsWithDeliveryIssues.indexOf(paymentStatus._id) !== -1);
      const cardExpiringSoon = Boolean(paymentsWithCardExpiringSoon.indexOf && paymentsWithCardExpiringSoon.indexOf(paymentStatus._id) !== -1);
      const accountVendor = JSON.stringify(_resolve(vendors, `${_resolve(paymentStatus, 'created.vendorId')}`, {}));
      const opsNotes = JSON.stringify(_opsNotes[`paymentStatuses/${context.organizationId}/${context.accountId}/${paymentStatus._oldId}` || `paymentStatuses/${context.organizationId}/${context.accountId}/${paymentStatus._id}`] || []);

      const pendingIssues = JSON.stringify((paymentStatus._issueIds || []).filter((issueId) => _pendingPaymentIssues[issueId] && _pendingPaymentIssues[issueId]._status === 'pending'));

      acc[id] = itemSelector(id)({
 paymentStatus: JSON.stringify(paymentStatus), deliveryIssue, cardExpiringSoon, pendingIssues, accountVendor, opsNotes, cardLast4s, paymentProcedure: JSON.stringify(paymentProcedure), groupName, tagName, 
});

      return acc;
    }, {})

);

function itemSelector(id) {

  return Utils.cachedSelector(
'selectors_csrPaymentsTableData_item', 
id,
(state) => state.paymentStatus, // string
    (state) => state.deliveryIssue, // boolean
    (state) => state.cardExpiringSoon, // boolean
    (state) => state.pendingIssues, // string
    (state) => state.accountVendor, // string
    (state) => state.opsNotes, // string
    (state) => state.cardLast4s, // string
    (state) => state.paymentProcedure, // string
    (state) => state.groupName, // string
    (state) => state.tagName, // string

    (_paymentStatus, deliveryIssue, cardExpiringSoon, _pendingIssues, _accountVendor, _opsNotes, cardLast4s, _paymentProcedure, groupName, tagName) => {
      const paymentStatus = JSON.parse(_paymentStatus);
      const pendingIssues = JSON.parse(_pendingIssues);
      const accountVendor = JSON.parse(_accountVendor);
      const opsNotes = JSON.parse(_opsNotes);

      // determine delivery methods
      let psopDeliveryMethod;
      let psopDeliveryMethodOrder;
      let paymentDeliveryMethod;

      if ((Object.keys(JSON.parse(_paymentProcedure)).length)) {

        const paymentProcedure = JSON.parse(_paymentProcedure);
        // Sorting order is Phone > Fax > Email > Portal
        paymentDeliveryMethod = _resolve(paymentProcedure, 'vCardDeliveryMethod', '');
        if (paymentProcedure && paymentProcedure.vCardDeliveryMethod === 'manual') {
          // Regex will match most phone number formats
          const isPhone = !!(paymentProcedure && paymentProcedure.notes && paymentProcedure.notes.match(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/));

          // we support phone twice to be backwards compatible. phone is now a vCardDeliveryMethod but we still want to support older ones that are on manual
          if (isPhone) {
            psopDeliveryMethod = 'Phone';
            psopDeliveryMethodOrder = 4;
          } else {
            psopDeliveryMethod = 'Portal';
            psopDeliveryMethodOrder = 1;
          }
        } else {
          psopDeliveryMethod = 'Unknown';
          psopDeliveryMethodOrder = 0;

          if (paymentProcedure && paymentProcedure.vCardDeliveryMethod === 'fax') {
            psopDeliveryMethod = 'Fax';
            psopDeliveryMethodOrder = 3;
          }
          if (paymentProcedure && paymentProcedure.vCardDeliveryMethod === 'email') {
            psopDeliveryMethod = 'Email';
            psopDeliveryMethodOrder = 2;
          }
          if (paymentProcedure && paymentProcedure.vCardDeliveryMethod === 'phone') {
            psopDeliveryMethod = 'Phone';
            psopDeliveryMethodOrder = 4;
          }
          if (paymentProcedure && (paymentProcedure.vCardDeliveryMethod === 'automation' || paymentProcedure.VCardDeliveryMethod === Constants.AUTOMATION_TAIKO)) {
            psopDeliveryMethod = 'Automation';
            psopDeliveryMethodOrder = 1;
          }
        }
      }

      const linked = _resolve(paymentStatus, 'verified.vendor.globalVendorRef');
      const paymentSent = paymentStatus.sent && _resolve(paymentStatus, 'sent.markedAsReadyToSendOrSent');

      let status = paymentStatus.status || 'Scheduled';
      if (paymentStatus._status === 'cancelled') {
        status = 'Cancelled';
      }

      let hasIssues = false;
      if (pendingIssues.length) {
        hasIssues = 'pending';
      } else if (_resolve(paymentStatus, '_issueIds.length')) {
        hasIssues = 'resolved';
      }

      let hasActiveErrors = false;
      let hasErrors = false;
      let errorMessage = '';
      if (_resolve(paymentStatus, 'created._errors.length') || _resolve(paymentStatus, 'verified._errors.length') || _resolve(paymentStatus, 'funded._errors.length') || _resolve(paymentStatus, 'sent._errors.length') || _resolve(paymentStatus, 'tracked._errors.length')) {
        hasErrors = true;
        errorMessage = _getLatestErrorMessage(paymentStatus);

        if (paymentStatus._status !== 'tracked' && paymentStatus._status !== 'cancelled') {
          hasActiveErrors = true;
        }
      }

      /**
       * @type {BotErrors}
       */
      let botErrors = null;
      if (paymentStatus.sent && paymentStatus.sent.botErrors) {
        botErrors = paymentStatus.sent.botErrors;
      }

      return {
        ...paymentStatus,
        createdAt: _resolve(paymentStatus, 'created._createdAt') || _resolve(paymentStatus, 'created._at') || Date.now(),
        vendorName: accountVendor && accountVendor.display || paymentStatus.verified && _resolve(paymentStatus, 'verified.vendor.displayName') && `${_resolve(paymentStatus, 'verified.vendor.displayName')} (${_resolve(paymentStatus, 'verified.vendor.name')})` || _resolve(paymentStatus, 'verified.vendor.name'),
        method: _resolve(paymentStatus, 'created.method'),
        amount: _resolve(paymentStatus, 'created.amount', 0),
        status,
        substatus: paymentStatus.substatus,
        statusClassOverride: status === 'Processing...' && linked && !_resolve(paymentStatus, 'sent.markedAsReadyToSendOrSent') && 'info',
        isActive: paymentStatus._status !== 'cancelled',
        refNumber: paymentStatus._ref,
        paymentId: paymentStatus._id,
        linked,
        paymentSent,
        hasIssues: !!hasIssues,
        hasIssuesStatus: hasIssues,
        hasPendingIssues: hasIssues === 'pending',
        hasErrors,
        hasActiveErrors,
        groupName,
        tagName,
        psopDeliveryMethod,
        psopDeliveryMethodOrder,
        paymentDeliveryMethod,
        deliveryIssue,
        cardExpiringSoon,
        errorMessage,
        opsNotes,
        cardLast4s,
        botErrors,
        details: _generatePaymentDetails(_resolve(paymentStatus, 'created.customFields'), _resolve(paymentStatus, 'created.paymentFields')),
      };
    }
  );

}

export default selectors_csrPaymentsTableData;

// Internal Helper Functions ...
const _getLatestErrorMessage = (paymentStatus) => {
  const _getLast = (array) => _try(() => array[array.length - 1], {});
  return _try(() => _getLast(_resolve(paymentStatus, 'tracked._errors', [])).message
    || _getLast(_resolve(paymentStatus, 'sent._errors', [])).message
    || _getLast(_resolve(paymentStatus, 'funded._errors', [])).message
    || _getLast(_resolve(paymentStatus, 'verified._errors', [])).message
    || _getLast(_resolve(paymentStatus, 'created._errors', [])).message);
};

function getVendorPSOP(globalTagId, paymentMethod, groupIds, globalGroups) {
  // look for the group where tag === globalTagId on paymentStatus
  const relevantGroup = groupIds && groupIds.find((groupId) => {
    const group = _resolve(globalGroups, groupId, {});
  
    return group.tagIds && group.tagIds.includes(globalTagId);
  });

  // protect against not finding a relevant group with tag matching gobalTagId on paymentStatus
  if (!globalGroups[relevantGroup]) { return; }

  const groupInfo = globalGroups[relevantGroup];

  const procedureId = !groupInfo[paymentMethod] ? '' : groupInfo[paymentMethod].procedure || '';

  return {
    procedureId,
    groupName: globalGroups[relevantGroup].name || '',
  };
}

const _generatePaymentDetails = (customFields, paymentFields) => {
  let details = [];
  if (customFields) { details = details.concat(Object.values(customFields)); }
  if (paymentFields) { details = details.concat(Object.values(paymentFields)); }

  return details.join(' ');
};
