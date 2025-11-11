// import Components from 'components';

const routerConfig = {
  noAuthRoutes: ["error404", "confirmemail", "resetpassword", "termsandconditions"],
  queryParams: [],
  persistantQueryParams: [],
  groups: {},
  categories: {
    wallet: {
      id: 'wallet',
      name: 'Wallet',
      group: 'default',
      icon: 'cardOutline',
    },
    documents: {
      id: 'documents',
      name: 'Documents',
      group: 'default',
      icon: 'documentText',
    },
    trips: {
      id: 'trips',
      name: 'Trips',
      group: 'default',
      icon: 'earth',
    },
    expenses: {
      id: 'expenses',
      name: 'Expenses',
      group: 'default',
      icon: 'receipt',
    },
    account: {
      id: 'account',
      name: 'Account',
      group: 'default',
      icon: 'person',
    },
  },
  routes: [{
    name: 'wallet',
    displayName: 'Wallet',
    path: '/',
    icon: false,
    category: 'wallet',
    location: 'Components.ionic.routes.wallet',
  },
  {
    name: 'trips',
    displayName: 'Trips',
    path: '/trips',
    icon: false,
    category: 'trips',
    location: 'Components.ionic.routes.trips',
  },
  {
    name: 'expenses',
    displayName: 'Expenses',
    path: '/expenses',
    icon: false,
    category: 'expenses',
    location: 'Components.ionic.routes.expenses',
    tabs: [{
      name: 'expenses',
      label: 'Expenses',
      component: 'Components.ionic.expenses',
    }, {
      name: 'create',
      label: 'Create Expense',
      component: 'Components.ionic.expenses',
    }, {
      name: 'create',
      label: 'Reports',
      component: 'Components.ionic.reports',
    }, {
      name: 'create',
      label: 'Create Report',
      component: 'Components.ionic.reports',
    }],
  },
  {
    name: 'account',
    displayName: 'Account',
    path: '/account',
    icon: false,
    category: 'account',
    location: 'Components.ionic.routes.account',
  },
  {
    name: 'documents',
    displayName: 'Documents',
    path: '/documents',
    icon: false,
    category: 'documents',
    location: 'Components.ionic.routes.documents',
  },
  {
    name: 'error404',
    displayName: '404',
    path: '404/',
    icon: false,
    category: 'errors',
    location: 'Components.routes.error404',
  },
  {
    name: 'confirmemail',
    displayName: 'confirmEmail',
    path: 'confirmEmail/',
    icon: false,
    category: 'errors',
    location: 'Components.routes.confirmemail',
  },
  {
    name: 'resetpassword',
    displayName: 'resetPassword',
    path: 'resetPassword/',
    icon: false,
    category: 'errors',
    location: 'Components.routes.resetpassword',
  },
  {
    name: 'termsandconditions',
    displayName: 'Terms And Conditions',
    path: 'terms-and-conditions/',
    icon: false,
    location: 'Components.routes.termsandconditions',
  }],
};

export default routerConfig;

// GENERATOR_TYPE='exporter';
