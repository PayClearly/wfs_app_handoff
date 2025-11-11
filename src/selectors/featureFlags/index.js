import createSelector from 'selector';


import Utils from 'utils';
import Selectors from 'selectors';

/* how feature flags work:
Feature flags now have three settings: ON, OFF, and CSR
  ON: this feature is on, and its components will always be rendered
  OFF: this feature is off, and its components will never be rendered
  CSR: this feature is in CSR only mode. Only CSRs and root level admins will be able to see these components
This selector will convert the ON OFF and CSR into appropriate booleans
feature flags must be set as default in the selector, it is the source of truth for the application when rendering
*/

const selectors_featureFlags = createSelector(
  'selectors_featureflags',

  // state => _try(() => state.prop.prop.prop.prop, {}),
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
      galileoACH: OFF,
      galileoCheck: OFF,
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
      // enableOpsAchDebit: OFF,
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
    // TODO :: Add this back after Advantage is fixed
    // if (_try(() => erpIntegrationType === 'ADVANTAGE')) {
    //   featureFlags.vendorCreateSingle = OFF;
    //   featureFlags.vendorCreateUpload = OFF;
    // }

    return Object.keys(featureFlags).reduce((acc, cur) => {
      if (featureFlags[cur] === ON) { acc[cur] = true; }
      if (featureFlags[cur] === CSR && canRead) { acc[cur] = true; }
      if (featureFlags[cur] === OFF) { acc[cur] = false; }
      return acc;
    }, {});


  }


);

export default selectors_featureFlags;


