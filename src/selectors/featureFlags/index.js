import createSelector from 'selector';

import Utils from 'utils';
import Selectors from 'selectors';

const selectors_featureFlags = createSelector(
  'selectors_featureflags',

  (state) => Selectors.context(state),
  (state) => state.router.route.params.features,
  (state) => state.account.featureFlags.data.item,
  (state) => Selectors.entity('globalVendors_*')(state).canRead,

  (context, featuresQuery = '', setFeatures = {}, canRead = false) => {
    const queryOverwrites = featuresQuery ? featuresQuery
      .split('-')
      .reduce((acc, curr) => ({ ...acc, [curr]: 'ON' }), {})
      : {};
    const overwrites = { ...setFeatures, ...queryOverwrites };
    const { organizationId } = context;
    const { OFF, ON, CSR } = Utils.getFeatureFlagEnum();

    const featureFlags = {
      mocker: OFF,
      apiKeys: OFF,
      invoices: OFF,
      expenses: OFF,
      approvals: OFF,
      ACH: ON,
      Checks: ON,
      providerACH: OFF,
      providerCheck: OFF,
      // integrations
      erpIntegration: ON,
      cardsIntegration: ON,
      checksIntegration: ON,
      achIntegration: ON,
      passwordsIntegration: ON,
      // widgets
      erpIntegrationStatus: ON,
      pendingPayments: ON,
      exposureManagement: OFF,
      automateExposureRelief: OFF,
      pendingItems: ON,
      // vendors
      vendorCreateSingle: ON,
      vendorCreateUpload: ON,
      enrollments: OFF,
      bulkVendorUploads: OFF,
      // clients
      clients: OFF,
      // payment methods
      paymentCreation: ON,
      paymentCards: ON,
      plastic: OFF,
      ftpPayments: CSR,
      // funding
      fundingTab: ON,
      manualDeposits: ON,
      manualWithdrawals: ON,
      achFunding: ON,
      /**

       * The 'enableOpsAchDebit' feature flag is currently commented out so that it will

       * not be editable by ops users. It can however exist and it's value

       * can be retrieved from firebase.

       */
      // WFS
      authRefresh: OFF,
      biometrics: OFF,
      paymentsTableUpdateCards: OFF,
      bypassPaymentUploader: OFF,
      ...overwrites,
    };

    // Im going to leave these in here for now, since they serve as useful hard coded overwriter
    // Plastic
    if (
      [
        'admin-org',
        'org-for-testing-policies',
        '45b00ea9-3990-45ec-a32c-c553891c1232',
      ].some((id) => organizationId === id)
    ) {
      featureFlags.plastic = ON;
    }

    // Invoices
    if (
      [].some((id) => organizationId === id)
    ) {
      featureFlags.invoices = ON;
    }

    // API keys
    if (
      [].some((id) => organizationId === id)
    ) {
      featureFlags.apiKeys = ON;
    }

    if (
      [
        'admin-org',
        'org-for-testing-policies',
      ].some((id) => organizationId === id)
    ) {
      featureFlags.Checks = ON;
    }

    if (
      [
        'admin-org',
        'wfs-org-sandbox',
      ].some((id) => organizationId === id)
    ) {
      featureFlags.pendingItems = OFF;
    }

    // Vendor Create
    //   featureFlags.vendorCreateSingle = OFF;
    //   featureFlags.vendorCreateUpload = OFF;

    return Object.keys(featureFlags).reduce((acc, cur) => {
      if (featureFlags[cur] === ON) { acc[cur] = true; }
      if (featureFlags[cur] === CSR && canRead) { acc[cur] = true; }
      if (featureFlags[cur] === OFF) { acc[cur] = false; }
      return acc;
    }, {});

  }

);

export default selectors_featureFlags;

