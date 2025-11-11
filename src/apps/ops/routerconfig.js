// import Components from 'components';

const routerConfig = {
  noAuthRoutes: ['error404', 'confirmemail', 'resetpassword', 'termsandconditions'],
  queryParams: ['token', 'uid', 'email', 'state', 'tab', 'name', 'modal'],
  persistantQueryParams: ['features'],
  groups: {
    support: {
      id: 'support',
      name: 'support',
    },
  },
  categories: {
    support: {
      id: 'support',
      name: 'Support',
      group: 'support',
      icon: 'mdi mdi-headset',
      onlyShowWithPrivileges: ['canAdministrateGlobalVendors'],
    },
  },
  routes: [
    {
      name: 'opsDashboard',
      displayName: 'Dashboard',
      path: '/',
      icon: false,
      category: 'support',
      location: 'Components.routes.opsDashboard',
      onlyShowWithSpecificPolicies: ['globalVendors_*_read'],
    },
    {
      name: 'globalvendors',
      displayName: 'Global Database',
      path: 'globalvendors/',
      icon: false,
      category: 'support',
      defaultTitle: 'Global Vendors',
      location: 'Components.routes.globalvendors',
      onlyShowWithSpecificPolicies: ['globalVendors_*_read'],
      tabTitles: {
        fields: 'Global Vendor Fields',
        creds: 'Global Vendor Creds',
        globalVendors: 'Global Vendors',
        tags: 'Global Vendor Tags',
        groups: 'Global Vendor Groups',
        metrics: 'Global Database Metrics',
      },
    },
    {
      name: 'bulkVendorUploads',
      displayName: 'Bulk Vendor Uploads',
      path: 'bulkVendorUploads/',
      icon: false,
      category: 'support',
      defaultTitle: 'Bulk Vendors Uploads',
      location: 'Components.routes.bulkVendorUploads',
      onlyShowWithSpecificPolicies: ['globalVendors_*_read'],
    },
    {
      name: 'resourceoverview',
      displayName: '',
      path: ':resource/:id',
      icon: false,
      category: '',
      location: 'Components.routes.resourceoverview',
    },
    {
      name: 'opsSearch',
      displayName: 'Search Payments',
      path: 'search/',
      icon: false,
      category: 'support',
      onlyShowWithPrivileges: ['canAdministrateGlobalVendors'],
      location: 'Components.routes.opsSearch',
    },
    {
      name: 'ghostBatches',
      displayName: 'Ghost Batches',
      path: 'ghostBatches/',
      icon: false,
      category: 'ghostBatches',
      onlyShowWithSpecificPolicies: ['jobs_*_*_update'],
      location: 'Components.routes.ghostBatches',
    },
  ],
  resourceNameToOverview: {
    csrpayment: { component: ['csrPaymentStatus', 'paymentstatus'], componentTitles: ['CSR View', 'User View'], storePath: 'account.paymentStatuses' },
  },
};

export default routerConfig;

// GENERATOR_TYPE='exporter';
