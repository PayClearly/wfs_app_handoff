import { combineReducers } from 'redux';
import { createActionTypes, reducerCreator } from 'store/_utilities/statusReducerFactory';

import Utils from 'utils';
import bluebird from 'bluebird';

import * as userActions from 'store/user';

import * as accountBalances from 'store/account/accountBalances';
import * as accountVendorCredentials from 'store/account/accountVendorCredentials';
import * as accountVendors from 'store/account/accountVendors';
import * as accountVendorEnrollments from 'store/account/accountVendorEnrollments';
import * as clients from 'store/account/clients';
import * as clientVendorLinks from 'store/account/clientVendorLinks';
import * as cardsIntegration from 'store/account/cardsIntegration';
import * as achIntegration from 'store/account/achIntegration';
import * as checksIntegration from 'store/account/checksIntegration';
import * as erpIntegration from 'store/account/erpIntegration';
import * as achAccountCredentials from 'store/account/achAccountCredentials';
import * as achAccountDetails from 'store/account/achAccountDetails';
import * as achAccounts from 'store/account/achAccounts';
import * as achTransfers from 'store/account/achTransfers';
import * as annotations from 'store/account/annotations';
import * as expenses from 'store/account/expenses';
import * as expenseReports from 'store/account/expenseReports';
import * as expenseReportComments from 'store/account/expenseReportComments';
import * as expenseReportApprovals from 'store/account/expenseReportApprovals';
import * as fundingIntegration from 'store/account/fundingIntegration';
import * as globalVendors from 'store/account/globalVendors';
import * as invoices from 'store/account/invoices';
import * as notificationPreferences from 'store/account/notificationPreferences';
import * as passwords from 'store/account/passwords';
import * as paymentCards from 'store/account/paymentCards';
import * as paymentCardChangeRequests from 'store/account/paymentCardChangeRequests';
import * as paymentCustomFields from 'store/account/paymentCustomFields';
import * as paymentCardCustomFields from 'store/account/paymentCardCustomFields';
import * as paymentPipelinePreferences from 'store/account/paymentPipelinePreferences';
import * as paymentStatuses from 'store/account/paymentStatuses';
import * as privateVirtualCard from 'store/account/privateVirtualCard';
import * as privateCardPRN from 'store/account/privateCardPRN';
import * as roles from 'store/account/roles';
import * as usps from 'store/account/usps';
import * as vendors from 'store/account/vendors';
import * as ftpAccountDetails from 'store/account/ftpAccountDetails';
import * as paymentIssues from 'store/account/paymentIssues';
import * as reportTemplates from 'store/account/reporttemplates';
import * as reports from 'store/account/reports';
import * as statements from 'store/statements';
import * as approvedStatements from 'store/statements/approvedStatements';
import * as jobs from 'store/jobs';
import * as revenueShares from 'store/revenueshares';
import * as featureFlags from 'store/account/featureFlags';
import * as paymentUploads from 'store/account/paymentUploads';
import * as ftpPayment from 'store/account/ftpPayment';
import * as validatedAddress from 'store/account/validatedAddress';
import * as taikoBots from 'store/account/taikoBots';
import * as taikoBotKeys from 'store/account/taikoBotKeys';
import * as kyc from 'store/account/kyc';
import * as opsNotes from 'store/account/opsNotes';
import * as batchPayments from 'store/account/batchPayments';
import * as pctrReport from 'store/account/pctrReport';
import * as checkActivityReport from 'store/account/checkActivityReport';
import * as sftp from 'store/account/sftp';

// APIs
import API_achIntegration from 'api/achIntegration';
import API_checksIntegration from 'api/checksIntegration';

const namespace = 'ACCOUNT';
const info = reducerCreator({ id: null }, namespace);
export const actionTypes = createActionTypes(namespace);

// Reducer
export const reducer = combineReducers({
  accountBalances: accountBalances.reducer,
  accountVendorCredentials: accountVendorCredentials.reducer,
  accountVendors: accountVendors.reducer,
  accountVendorEnrollments: accountVendorEnrollments.reducer,
  clients: clients.reducer,
  clientVendorLinks: clientVendorLinks.reducer,
  achAccountCredentials: achAccountCredentials.reducer,
  achAccountDetails: achAccountDetails.reducer,
  achIntegration: achIntegration.reducer,
  erpIntegration: erpIntegration.reducer,
  passwords: passwords.reducer,
  fundingIntegration: fundingIntegration.reducer,
  expenses: expenses.reducer,
  expenseReports: expenseReports.reducer,
  expenseReportComments: expenseReportComments.reducer,
  expenseReportApprovals: expenseReportApprovals.reducer,
  achAccounts: achAccounts.reducer,
  achTransfers: achTransfers.reducer,
  annotations: annotations.reducer,
  data: info.reducer,
  featureFlags: featureFlags.reducer,
  globalVendors: globalVendors.reducer,
  invoices: invoices.reducer,
  notificationPreferences: notificationPreferences.reducer,
  paymentCards: paymentCards.reducer,
  paymentCardChangeRequests: paymentCardChangeRequests.reducer,
  paymentCustomFields: paymentCustomFields.reducer,
  paymentCardCustomFields: paymentCardCustomFields.reducer,
  paymentPipelinePreferences: paymentPipelinePreferences.reducer,
  paymentStatuses: paymentStatuses.reducer,
  privateVirtualCard: privateVirtualCard.reducer,
  privateCardPRN: privateCardPRN.reducer,
  roles: roles.reducer,
  jobs: jobs.reducer,
  usps: usps.reducer,
  vendors: vendors.reducer,
  cardsIntegration: cardsIntegration.reducer,
  checksIntegration: checksIntegration.reducer,
  ftpAccountDetails: ftpAccountDetails.reducer,
  paymentIssues: paymentIssues.reducer,
  reports: reports.reducer,
  reportTemplates: reportTemplates.reducer,
  paymentUploads: paymentUploads.reducer,
  ftpPayment: ftpPayment.reducer,
  validatedAddress: validatedAddress.reducer,
  taikoBots: taikoBots.reducer,
  taikoBotKeys: taikoBotKeys.reducer,
  kyc: kyc.reducer,
  opsNotes: opsNotes.reducer,
  batchPayments: batchPayments.reducer,
  sftp: sftp.reducer,
  pctrReport: pctrReport.reducer,
  checkActivityReport: checkActivityReport.reducer,
});

export default reducer;

const integrations = {
  erpIntegration,
  cardsIntegration,
  fundingIntegration,
  checksIntegration,
  achIntegration,
};

export function sync(accountId) {
  return (dispatch, getState) => {
    const appStoreConfig = _try(() => getState().appConfig.data.store);

    const organizationId = getState().organization.data.id;
    const accountItems = getState().accounts.data.items;
    const accountIdPreference = getState().user.preferences.data.item.accountContext;
    if (!accountItems[accountId]) {
      accountId = '';
    }
    const id = accountId // selected org
      || (accountItems[accountIdPreference] && (accountItems[accountIdPreference].active && !accountItems[accountIdPreference].suspended) && accountIdPreference) // last selected active org
      || Object.keys(accountItems).filter((account) => accountItems[account].active && !accountItems[account].suspended)[0] // first active account in list
      || Object.keys(accountItems)[0]; // first orgIn list

    if (id === getState().account.data.id) {
      return Promise.resolve();
    }

    userActions.updatePreferences({
      orgContext: organizationId,
      accountContext: id,
    })(dispatch, getState);
    const desiredContext = { organizationId, accountId: id };

    // Order determines what loads first
    clear()(dispatch, getState);
    info.set({ id })(dispatch, getState);

    [
      { key: 'featureFlags', actionCreators: featureFlags },
      { key: 'accountBalances', actionCreators: accountBalances },
      { key: 'achAccountDetails', actionCreators: achAccountDetails },
      { key: 'achAccounts', actionCreators: achAccounts },
      { key: 'paymentCards', actionCreators: paymentCards },
      { key: 'paymentCardChangeRequests', actionCreators: paymentCardChangeRequests },
      { key: 'paymentCustomFields', actionCreators: paymentCustomFields },
      { key: 'paymentCardCustomFields', actionCreators: paymentCardCustomFields },
      { key: 'paymentPipelinePreferences', actionCreators: paymentPipelinePreferences },
      { key: 'ftpAccountDetails', actionCreators: ftpAccountDetails },
      { key: 'roles', actionCreators: roles },
      { key: 'globalVendors', actionCreators: globalVendors },
      { key: 'accountVendors', actionCreators: accountVendors },
      { key: 'clients', actionCreators: clients },
      { key: 'clientVendorLinks', actionCreators: clientVendorLinks },
      { key: 'erpIntegration', actionCreators: erpIntegration },
      { key: 'accountVendorCredentials', actionCreators: accountVendorCredentials },
      { key: 'paymentStatuses', actionCreators: paymentStatuses },
      { key: 'reportTemplates', actionCreators: reportTemplates },
      { key: 'reports', actionCreators: reports },
      { key: 'statements', actionCreators: statements },
      { key: 'jobs', actionCreators: jobs },
      { key: 'revenueShares', actionCreators: revenueShares },
      { key: 'paymentIssues', actionCreators: paymentIssues },
      { key: 'notificationPreferences', actionCreators: notificationPreferences },
      { key: 'fundingIntegration', actionCreators: fundingIntegration },
      { key: 'achTransfers', actionCreators: achTransfers },
      { key: 'cardsIntegration', actionCreators: cardsIntegration },
      { key: 'approvedStatements', actionCreators: approvedStatements },
      { key: 'checksIntegration', actionCreators: checksIntegration },
      { key: 'achIntegration', actionCreators: achIntegration },
      { key: 'passwords', actionCreators: passwords },
      { key: 'invoices', actionCreators: invoices },
      { key: 'expenses', actionCreators: expenses },
      { key: 'expenseReports', actionCreators: expenseReports },
      { key: 'expenseReportComments', actionCreators: expenseReportComments },
      { key: 'expenseReportApprovals', actionCreators: expenseReportApprovals },
      { key: 'paymentUploads', actionCreators: paymentUploads },
      { key: 'accountVendorEnrollments', actionCreators: accountVendorEnrollments },
      { key: 'ftpPayment', actionCreators: ftpPayment },
      { key: 'batchPayments', actionCreators: batchPayments },
      { key: 'kyc', actionCreators: kyc },
      { key: 'opsNotes', actionCreators: opsNotes },
      { key: 'taikoBotKeys', actionCreators: taikoBotKeys },
      { key: 'pctrReport', actionCreators: pctrReport },
    ].reduce((acc, curr) => {
      const { key, actionCreators } = curr;

      if (!_try(() => appStoreConfig.account[key])) { return acc; }
      return acc.then(() => actionCreators.sync(organizationId, id)(dispatch, getState))
        .then(() => {
          const currentContext = { organizationId: getState().organization.data.id, accountId: getState().account.data.id };
          if (!Utils.contextMatch(currentContext, desiredContext)) {
            actionCreators.clear()(dispatch, getState);
            throw new Error('context error');
          }
          return Promise.resolve();
        });
    }, Promise.resolve())
      .catch((err) => {
        if (_try(() => err.message === 'context error')) {
          if (window.GLOBALCERT.projectId === 'TEST-ENV_CHANGE-ME') { console.log('Context switch before full load'); }
        } else {
          throw err;
        }
      });

  };
}

export function clear() {
  return (dispatch, getState) => {
    accountBalances.clear()(dispatch, getState);
    accountVendorCredentials.clear()(dispatch, getState);
    accountVendors.clear()(dispatch, getState);
    accountVendorEnrollments.clear()(dispatch, getState);
    clients.clear()(dispatch, getState);
    clientVendorLinks.clear()(dispatch, getState);
    erpIntegration.clear()(dispatch, getState);
    achAccountDetails.clear()(dispatch, getState);
    achAccounts.clear()(dispatch, getState);
    achTransfers.clear()(dispatch, getState);
    approvedStatements.clear()(dispatch, getState);
    fundingIntegration.clear()(dispatch, getState);
    globalVendors.clear()(dispatch, getState);
    info.clear()(dispatch, getState);
    notificationPreferences.clear()(dispatch, getState);
    opsNotes.clear()(dispatch, getState);
    paymentCards.clear()(dispatch, getState);
    paymentCardChangeRequests.clear()(dispatch, getState);
    paymentCustomFields.clear()(dispatch, getState);
    paymentCardCustomFields.clear()(dispatch, getState);
    paymentPipelinePreferences.clear()(dispatch, getState);
    paymentStatuses.clear()(dispatch, getState);
    roles.clear()(dispatch, getState);
    vendors.clear()(dispatch, getState);
    cardsIntegration.clear()(dispatch, getState);
    ftpAccountDetails.clear()(dispatch, getState);
    paymentIssues.clear()(dispatch, getState);
    reportTemplates.clear()(dispatch, getState);
    achIntegration.clear()(dispatch, getState);
    checksIntegration.clear()(dispatch, getState);
    reports.clear()(dispatch, getState);
    revenueShares.clear()(dispatch, getState);
    statements.clear()(dispatch, getState);
    jobs.clear()(dispatch, getState);
    invoices.clear()(dispatch, getState);
    featureFlags.clear()(dispatch, getState);
    expenses.clear()(dispatch, getState);
    expenseReports.clear()(dispatch, getState);
    expenseReportComments.clear()(dispatch, getState);
    expenseReportApprovals.clear()(dispatch, getState);
    paymentUploads.clear()(dispatch, getState);
    ftpPayment.clear()(dispatch, getState);
    validatedAddress.clear()(dispatch, getState);
    taikoBots.clear()(dispatch, getState);
    taikoBotKeys.clear()(dispatch, getState);
    kyc.clear()(dispatch, getState);
    batchPayments.clear()(dispatch, getState);
    passwords.clear()(dispatch, getState);
    sftp.clear()(dispatch, getState);
    pctrReport.clear()(dispatch, getState);
    checkActivityReport.clear()(dispatch, getState);
  };
}

export function fetchPaymentKeys(filters) {
  return (dispatch, getState) => paymentStatuses.initializeFiltered(getState().organization.data.id, getState().account.data.id, filters)(dispatch, getState);
}

export function getRangeOfPayments(currentIndex) {
  return (dispatch, getState) => {
    const organization = getState().organization.data.id;
    const account = getState().account.data.id;
    const payments = getState().account.paymentStatuses.data.items;
    const keys = getState().account.paymentStatuses.collections.paymentKeys[`${organization}/${account}`];
    const keysArray = Object.keys(keys);
    const fetchedPayments = getState().account.paymentStatuses.collections.fetched[`${organization}/${account}`];
    const fetchedPaymentIds = Object.keys(fetchedPayments || {}).filter((val) => fetchedPayments[val] === true);
    if (!keysArray.length) { return; }

    // the length of payments tells us where to start our next fetch
    const startingIndex = Object.keys(payments).length - fetchedPaymentIds.length;
    const fetchAhead = 199;

    const start = keysArray[startingIndex];
    let end;

    if (currentIndex && currentIndex > startingIndex) {
      end = keysArray[currentIndex + fetchAhead] ? keysArray[currentIndex + fetchAhead] : keysArray[keysArray.length - 1];
    } else {
      end = keysArray[startingIndex + fetchAhead] ? keysArray[startingIndex + fetchAhead] : keysArray[keysArray.length - 1];
    }

    return paymentStatuses.fetchRangeOfPayments(organization, account, start, end)(dispatch, getState);
  };
}

export function syncCardsIntegration(paymentId) {
  return (dispatch, getState) => {
    const organizationId = getState().organization.data.id;
    const accountId = getState().account.data.id;
    return cardsIntegration.syncRelevantData(organizationId, accountId, paymentId)(dispatch, getState);
  };
}

export function syncCheckIntegration(paymentId) {
  return (dispatch, getState) => {
    const organizationId = getState().organization.data.id;
    const accountId = getState().account.data.id;
    return checksIntegration.syncRelevantData(organizationId, accountId, paymentId)(dispatch, getState);
  };
}

export function syncAchIntegration(paymentId) {
  return (dispatch, getState) => {
    const organizationId = getState().organization.data.id;
    const accountId = getState().account.data.id;
    return achIntegration.syncRelevantData(organizationId, accountId, paymentId)(dispatch, getState);
  };
}

export function syncClients(paymentId) {
  return (dispatch, getState) => {
    const organizationId = getState().organization.data.id;
    const accountId = getState().account.data.id;
    return clients.syncRelevantData(organizationId, accountId, paymentId)(dispatch, getState);
  };
}

export function syncPaymentIssues(paymentId) {
  return (dispatch, getState) => {
    const organizationId = getState().organization.data.id;
    const accountId = getState().account.data.id;
    return paymentIssues.syncRelevantData(organizationId, accountId, paymentId)(dispatch, getState);
  };
}
export function syncResources(paymentId) {
  return (dispatch, getState) => {
    const organizationId = getState().organization.data.id;
    const accountId = getState().account.data.id;

    const resources = [accountVendors, paymentIssues, clients, achTransfers];
    const payment = getState().account.paymentStatuses.data.items[paymentId];
    switch (payment.created.method) {
      case 'vCard':
        resources.push(cardsIntegration);
        break;
      case 'check':
        resources.push(checksIntegration);
        break;
      case 'ACH':
        resources.push(achIntegration);
        break;
      default:
        break;
    }
    return Promise.all(
      resources.map((resource) => resource.syncRelevantData(organizationId, accountId, paymentId)(dispatch, getState))
    );
  };
}
export function syncQueuedResolvedIssues() {
  return (dispatch, getState) => {
    const organizationId = getState().organization.data.id;
    const accountId = getState().account.data.id;
    return paymentIssues.syncQueuedResolvedIssues(organizationId, accountId)(dispatch, getState);
  };
}
export function updateFeatureFlags(data) {
  return (dispatch, getState) => featureFlags.update(getState().organization.data.id, getState().account.data.id, data)(dispatch);
}

export function createPaymentCard(data, fileName) {
  return (dispatch, getState) => paymentCards.create(getState().organization.data.id, getState().account.data.id, data, fileName)(dispatch);
}

export function updatePaymentCard(data, action) {
  return (dispatch, getState) => paymentCards.update(getState().organization.data.id, getState().account.data.id, data, action)(dispatch);
}

export function clearErrorsPaymentCards() {
  return (dispatch, getState) => {
    paymentCards.clearErrors()(dispatch, getState);
  };
}

export function fetchPrivateACHCreds() {
  return (dispatch, getState) => achAccountCredentials.fetchPrivate(getState().organization.data.id, getState().account.data.id)(dispatch, getState);
}

export function fetchFtpPayment(data) {
  return (dispatch, getState) => ftpPayment.fetch(data)(dispatch, getState);
}

export function clearFtpPayment() {
  return (dispatch, getState) => ftpPayment.clear()(dispatch, getState);
}

export function clearPrivateACHCreds() {
  return (dispatch, getState) => achAccountCredentials.clear()(dispatch, getState);
}

export function updateAccountRoles(userId, role) {
  return (dispatch, getState) => roles.updateRoles('account', userId, role)(dispatch, getState);
}

export function clearErrorsAccountRoles() {
  return (dispatch, getState) => {
    roles.clearErrors()(dispatch, getState);
  };
}

export function updatePaymentPipelinePreferences(data) {
  return (dispatch, getState) => paymentPipelinePreferences.update(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function fetchPrivateVirtualCards(ids) {
  return (dispatch, getState) => privateVirtualCard.fetch(getState().organization.data.id, getState().account.data.id, ids)(dispatch);
}

export function clearPrivateVirtualCard() {
  return (dispatch, getState) => privateVirtualCard.clear()(dispatch, getState);
}

export function fetchPrivateCredentials(data) {
  return (dispatch, getState) => passwords.fetch(getState().organization.data.id, getState().account.data.id, data)(dispatch);
}

export function clearPrivateCredentials() {
  return (dispatch, getState) => passwords.clear()(dispatch, getState);
}

// integrations
export function updateIntegrationPreferences(type, data) {
  return (dispatch, getState) => integrations[type].updatePreferences(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function linkIntegration(type, data) {
  return (dispatch, getState) => integrations[type].link(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function updateIntegration(type, data) {
  return (dispatch, getState) => integrations[type].update(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function unlinkIntegration(type, data) {
  return (dispatch, getState) => integrations[type].unlink(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function getIntegrationIssues({ integrationType, issueType }) {
  return (dispatch, getState) => integrations[integrationType].getIssues(getState().organization.data.id, getState().account.data.id, issueType)(dispatch, getState);
}

export function clearErrorsIntegration(type) {
  return (dispatch, getState) => integrations[type].clearErrors()(dispatch, getState);
}

export function syncIntegrationQueues(type, queue) {
  return (dispatch, getState) => integrations[type].syncQueue(queue)(dispatch, getState);
}

// -- erpIntegration
export function createErpIntegrationVendor(data) {
  return (dispatch, getState) => erpIntegration.createVendor(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

// -- cardsIntegration
export function createCardsIntegrationVCard(data) {
  return (dispatch, getState) => cardsIntegration.createVCard(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function updateCardsIntegrationVCard(data) {
  return (dispatch, getState) => cardsIntegration.updateVCard(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function createCardsIntegrationPCard(data) {
  return (dispatch, getState) => cardsIntegration.createPCard(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function updateCardsIntegrationPCard(data) {
  return (dispatch, getState) => cardsIntegration.updatePCard(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function createCardsIntegrationAccount(data) {
  return (dispatch, getState) => cardsIntegration.createAccount(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

// -- checksIntegration

// SmartPayables Integration
export function fetchCheckProofImageForReview() {
  return (dispatch, getState) => checksIntegration.fetchCheckProofImage()(dispatch, getState);
}

// -- fundingIntegration
export function createFundingIntegrationTransfer(data) {
  return (dispatch, getState) => fundingIntegration.createTransfer(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function updateFundingIntegrationTransfer(data) {
  return (dispatch, getState) => fundingIntegration.updateTransfer(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

// preferences
export function clearErrorsPaymentPipelinePreferences() {
  return (dispatch, getState) => paymentPipelinePreferences.clearErrors()(dispatch, getState);
}

export function updatePaymentCustomFields(data) {
  return (dispatch, getState) => paymentCustomFields.update(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function clearErrorsPaymentCustomFields() {
  return (dispatch, getState) => paymentCustomFields.clearErrors()(dispatch, getState);
}

export function updatePaymentCardCustomFields(data) {
  return (dispatch, getState) => paymentCardCustomFields.update(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function clearErrorsPaymentCardCustomFields() {
  return (dispatch, getState) => paymentCardCustomFields.clearErrors()(dispatch, getState);
}

export function updateachAccountCredentials(data, fundingPreferencesData = null) {
  return (dispatch, getState) => {
    Promise.all([
      linkIntegration('fundingIntegration', {
        provider: 'STUB',
        creds: {
          ...data,
        },
        details: {
          ...data,
          accountNumber: `xxxxxxx${data.accountNumber.slice(7, 9)}`,
        },
        preferences: {
          ...(fundingPreferencesData || {}),
        },
      })(dispatch, getState),
      achAccountCredentials.update(getState().organization.data.id, getState().account.data.id, { ...data })(dispatch, getState),
    ])
      .then(() => {
        if (fundingPreferencesData) {
          return achAccountDetails.updateFundingPreferences(getState().organization.data.id, getState().account.data.id, { fundingPreferences: { ...fundingPreferencesData } })(dispatch, getState);
        }
      });
  };
}

export function clearNotificationErrors() {
  return (dispatch) => notificationPreferences.clearErrors()(dispatch);
}

export function enrollNotificationDevice(data) {
  return (dispatch, getState) => {
    notificationPreferences.enroll(getState().user.access.data.uid, data)(dispatch, getState);
  };
}

export function updateNotificationPreference(eventId, data) {
  return (dispatch, getState) => {
    notificationPreferences.update(getState().user.access.data.uid, eventId, data)(dispatch, getState);
  };
}

export function deleteachAccountCredentials() {
  return (dispatch, getState) => achAccountCredentials.remove(getState().organization.data.id, getState().account.data.id)(dispatch, getState);
}

export function clearErrorsAchAccountCredentials() {
  return (dispatch, getState) => {
    achAccountCredentials.clearErrors()(dispatch, getState);
  };
}

export function updateAchAccountDetails(data) {
  return (dispatch, getState) => achAccountDetails.updateFundingPreferences(getState().organization.data.id, getState().account.data.id, { ...data })(dispatch, getState);
}

export function clearErrorsAchAccountDetails() {
  return (dispatch, getState) => {
    achAccountDetails.clearErrors()(dispatch, getState);
  };
}

export function createVendors(data) {
  return (dispatch, getState) => vendors.create(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function createAccountVendors(data) {
  return (dispatch, getState) => accountVendors.create(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function updateAccountVendor(data) {
  return (dispatch, getState) => accountVendors.update(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function validateAccountVendorAddress(data) {
  return (dispatch, getState) => validatedAddress.validateAddress(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function clearValidatedAddress(data) {
  return (dispatch, getState) => validatedAddress.clear()(dispatch, getState);
}

export function clearErrorsAccountVendors() {
  return (dispatch, getState) => {
    accountVendors.clearErrors()(dispatch, getState);
  };
}

export function updateAccountVendorEnrollment(id, data) {
  return (dispatch, getState) => accountVendorEnrollments.update(getState().organization.data.id, getState().account.data.id, id, data)(dispatch, getState);
}

export function clearErrorsAccountVendorEnrollments() {
  return (dispatch, getState) => {
    accountVendorEnrollments.clearErrors()(dispatch, getState);
  };
}

export function setAccountVendorCredential(data) {
  return (dispatch, getState) => accountVendorCredentials.set(getState().organization.data.id, getState().account.data.id, data.id, data)(dispatch, getState);
}

export function clearErrorsAccountVendorCredentials() {
  return (dispatch, getState) => {
    accountVendorCredentials.clearErrors()(dispatch, getState);
  };
}

export function updateVendor(data) {
  return (dispatch, getState) => {
    const { forms } = getState();
    const vendorId = data.vendors;
    const payload = {
      ...forms.CreateVendorForm[vendorId]._values,
    };
    const paymentStrategies = {};

    const selectedPaymentForm = forms[forms.CreateVendorForm[vendorId].selectedPaymentForm.value][vendorId];
    paymentStrategies[selectedPaymentForm._id.value] = {
      ...selectedPaymentForm._values,
    };
    payload.paymentStrategies = paymentStrategies;
    return vendors.update(getState().organization.data.id, getState().account.data.id, vendorId, payload)(dispatch, getState);
  };
}

export function createClient(data) {
  return (dispatch, getState) => clients.create(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function createClients(items, fileName) {
  return (dispatch, getState) => clients.createMultiple(getState().organization.data.id, getState().account.data.id, items, fileName)(dispatch, getState);
}

export function updateClient(id, data) {
  return (dispatch, getState) => clients.update(getState().organization.data.id, getState().account.data.id, id, data)(dispatch, getState);
}

export function clearErrorsClients() {
  return (dispatch, getState) => {
    clients.clearErrors()(dispatch, getState);
  };
}

export function updateClientVendorLink(id, data) {
  return (dispatch, getState) => clientVendorLinks.update(getState().organization.data.id, getState().account.data.id, id, data)(dispatch, getState);
}

export function updateClientVendorLinks(items, fileName) {
  return (dispatch, getState) => clientVendorLinks.updateMultiple(getState().organization.data.id, getState().account.data.id, items, fileName)(dispatch, getState);
}

export function clearErrorsClientVendorLinks() {
  return (dispatch, getState) => {
    clientVendorLinks.clearErrors()(dispatch, getState);
  };
}

export function createPayments(data, instantTransfer, acceptedFile) {
  return (dispatch, getState) => paymentStatuses.create(getState().organization.data.id, getState().account.data.id, data, acceptedFile)(dispatch, getState)
    .then((paymentData) => {
      if (!instantTransfer.enabled || !paymentData) { return; }

      const orgId = Object.keys(paymentData)[0];
      const accId = Object.keys(paymentData[orgId])[0];
      const createdPaymentIds = Object.keys(paymentData[orgId][accId]);

      const achsIntegration = getState().account.achIntegration.data.details || {};
      const checkIntegration = getState().account.checksIntegration.data.details || {};

      const achProvider = achsIntegration.provider || null;
      const checkProvider = checkIntegration.provider || null;

      const vCardData = createdPaymentIds.reduce((acc, paymentId) => {
        const paymentStatus = getState().account.paymentStatuses.data.items[paymentId];

        const paymentMethod = paymentStatus.created.method;

        const usesVirtualCardAccount = paymentMethod === 'vCard'
          || (paymentMethod === 'ACH' && achProvider === 'CHANGE_ME_PROVIDER')
          || (paymentMethod === 'check' && checkProvider === 'CHANGE_ME_PROVIDER');

        const vCardAmount = (usesVirtualCardAccount && paymentStatus.created.amount) || 0;
        if (!vCardAmount) { return acc; }
        return {
          totalToFund: Utils.addDollars([vCardAmount, acc.totalToFund]),
          toFund: {
            ...acc.toFund,
            [paymentStatus._id]: vCardAmount,
          },
        };
      }, { toFund: {}, totalToFund: 0 });

      const amount = Utils.addDollars([vCardData.totalToFund, -instantTransfer.deduct, instantTransfer.add]);

      if (amount <= 0) {
        return;
      }

      const transfer = {
        amount,
        note: `${instantTransfer.notePrefix}${(new Date().toLocaleDateString('en-US'))}`,
        _forPayments: { ...vCardData.toFund, ...instantTransfer.otherPayments },
      };

      return createAchTransfer(transfer)(dispatch, getState);
    });
}

export function createPaymentsWithText({ textPayments, paymentUploadId, contentType }) {
  return (dispatch, getState) => paymentStatuses.createWithText(getState().organization.data.id, getState().account.data.id, { textPayments, paymentUploadId, contentType })(dispatch, getState);
}

export function uploadInvoices(data) {
  return (dispatch, getState) => invoices.upload(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function updateInvoice(data) {
  return (dispatch, getState) => invoices.update(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function getAnnotation(id) {
  return (dispatch, getState) => annotations.sync(getState().organization.data.id, getState().account.data.id, id)(dispatch, getState);
}

export function clearAnnotation() {
  return (dispatch, getState) => annotations.clear()(dispatch, getState);
}

export function updateAnnotation(data) {
  return (dispatch, getState) => annotations.update(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function clearErrorsPayments() {
  return (dispatch, getState) => paymentStatuses.clearErrors()(dispatch, getState);
}

export function updatePaymentPipelines(ids, actionName, params) {
  return (dispatch, getState) => paymentStatuses.update(getState().organization.data.id, getState().account.data.id, ids, actionName, params)(dispatch, getState);
}

export function clearErrorsPaymentPipelines() {
  return (dispatch, getState) => paymentStatuses.clearErrors()(dispatch, getState);
}

// FUNDING
export function createAchTransfer(data) {
  return (dispatch, getState) => achTransfers.create(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function sendAchTransfer(id, data) {
  return (dispatch, getState) => achTransfers.sendTransfer(getState().organization.data.id, getState().account.data.id, id, data)(dispatch, getState);
}

export function updateAchTransferStatus(id, data) {
  return (dispatch, getState) => achTransfers.updateStatus(getState().organization.data.id, getState().account.data.id, id, data)(dispatch, getState);
}

export function clearErrorsAchTransfers() {
  return (dispatch, getState) => achTransfers.clearErrors()(dispatch, getState);
}

// Dwolla Integration
export function fetchDwollaIavToken() {
  return (dispatch, getState) => API_achIntegration.getGroviderSetupResource(getState().organization.data.id, getState().account.data.id, 'iavToken');
}

export function fetchDwollaBusinessClassifications() {
  return (dispatch, getState) => API_achIntegration.getGroviderSetupResource(getState().organization.data.id, getState().account.data.id, 'businessClassifications');
}

export function verifyMailingAddress(mailingAddress) {
  return (dispatch, getState) => usps.verify(mailingAddress)(dispatch, getState);
}

export function createFtpAccount(data) {
  return (dispatch, getState) => ftpAccountDetails.set(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function updateFtpAccount(data) {
  return (dispatch, getState) => ftpAccountDetails.update(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function clearFtpAccountDetailErrors() {
  return (dispatch, getState) => {
    ftpAccountDetails.clearErrors()(dispatch, getState);
  };
}

export function submitQueuedResolvedIssues(data) {
  return (dispatch, getState) => paymentIssues.submitQueuedResolvedIssues(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function clearPaymentIssuesErrors() {
  return (dispatch, getState) => {
    paymentIssues.clearErrors()(dispatch, getState);
  };
}

// expenses

export function createExpense(data) {
  return (dispatch, getState) => expenses.create(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function updateExpense(id, data) {
  return (dispatch, getState) => expenses.update(getState().organization.data.id, getState().account.data.id, id, data)(dispatch, getState);
}

export function clearErrorsExpenses() {
  return (dispatch, getState) => {
    expenses.clearErrors()(dispatch, getState);
  };
}

export function createExpenseReport(data) {
  return (dispatch, getState) => expenseReports.create(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function updateExpenseReport(id, data) {
  return (dispatch, getState) => expenseReports.update(getState().organization.data.id, getState().account.data.id, id, data)(dispatch, getState);
}

export function clearErrorsExpenseReports() {
  return (dispatch, getState) => {
    expenseReports.clearErrors()(dispatch, getState);
  };
}

export function createExpenseReportComment(data) {
  return (dispatch, getState) => expenseReportComments.create(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function updateExpenseReportComment(id, data) {
  return (dispatch, getState) => expenseReportComments.update(getState().organization.data.id, getState().account.data.id, id, data)(dispatch, getState);
}

export function clearErrorsExpenseReportComments() {
  return (dispatch, getState) => {
    expenseReportComments.clearErrors()(dispatch, getState);
  };
}

export function createExpenseReportApproval(data) {
  return (dispatch, getState) => expenseReportApprovals.create(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function updateExpenseReportApproval(id, data) {
  return (dispatch, getState) => expenseReportApprovals.update(getState().organization.data.id, getState().account.data.id, id, data)(dispatch, getState);
}

export function clearErrorsExpenseReportApprovals() {
  return (dispatch, getState) => {
    expenseReportApprovals.clearErrors()(dispatch, getState);
  };
}

// KYC

export function createBusinessEnrollment(data) {
  return (dispatch, getState) => kyc.createBusinessEnrollment(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function createCustomerEnrollment(data) {
  return (dispatch, getState) => kyc.enrollCustomer(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}

export function updateCustomerEnrollment(data, customerId) {
  return (dispatch, getState) => kyc.updateCustomer(getState().organization.data.id, getState().account.data.id, data, customerId)(dispatch, getState);
}

export function deleteCustomerEnrollment(id) {
  return (dispatch, getState) => kyc.deleteCustomer(getState().organization.data.id, getState().account.data.id, id)(dispatch, getState);
}

export function retrieveCustomerEnrollment(id) {
  return (dispatch, getState) => kyc.retrieveCustomer(getState().organization.data.id, getState().account.data.id, id)(dispatch, getState);
}

export function retrieveCustomerEnrollments() {
  return (dispatch, getState) => kyc.sync(getState().organization.data.id, getState().account.data.id)(dispatch, getState);
}

export function clearFetchedCustomerEnrollment() {
  return (dispatch, getState) => kyc.clearCustomer(getState().organization.data.id, getState().account.data.id)(dispatch, getState);
}

export function fetchOpsNotesWithContext(context) {
  return (dispatch, getState) => opsNotes.fetchNotesFromContext(context)(dispatch, getState);
}

export function syncAchTransfers(paymentIds) {
  return (dispatch, getState) => achTransfers.syncRelevantData(getState().organization.data.id, getState().account.data.id, paymentIds)(dispatch, getState);
}

export function fetchPaymentsWithIds(start, end) {
  return (dispatch, getState) => paymentStatuses.fetchPaymentsWithIds(getState().organization.data.id, getState().account.data.id, start, end)(dispatch, getState);
}

export function createOpsNotes(resource, data) {
  return (dispatch, getState) => {
    const context = {
      accountId: getState().account.data.id,
      organizationId: getState().organization.data.id,
      ...resource,
    };
    return opsNotes.create(context, data)(dispatch, getState);
  };
}

export function fetchResource(resourceId, storeReducer, organizationId, accountId) {
  switch (storeReducer) {
    case 'paymentStatuses':
      return paymentStatuses.fetchResource(organizationId, accountId, resourceId);
    default:
      return Promise.resolve();
  }
}

export function updatePaymentUpload(data) {
  return (dispatch, getState) => paymentUploads.updatePaymentUpload(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
}
