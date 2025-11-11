import { combineReducers } from 'redux';

// models
import account from 'store/account';
import accounts from 'store/accounts';
import appConfig from 'store/appConfig';
import admin from 'store/admin';
import apiKeys from 'store/apikeys';
import cloudFunctionStatus from 'store/cloudfunctionstatus';
import cookies from 'store/cookies';
import revenueShares from 'store/revenueshares';
import device from 'store/device';
import forms from 'store/forms';
import global from 'store/global';
import eventDefinitions from 'store/eventDefinitions';
import integrationDefinitions from 'store/integrationDefinitions';
import mockedIntegrations from 'store/mockedIntegrations';
import notificationStatuses from 'store/notificationstatuses';
import oauth from 'store/oauth';
import opsPayments from 'store/opsPayments';
import organization from 'store/organization';
import organizations from 'store/organizations';
import router from 'store/router';
import statements from 'store/statements';
import tables from 'store/tables';
import termsAndConditions from 'store/termsandconditions';
import user from 'store/user';
import users from 'store/users';
import validations from 'store/validations';
import jobs from 'store/jobs';
import transactionDetails from 'store/transactionDetails';
import reportJobs from 'store/reportjobs';
import magicLinks from 'store/magicLinks';
import resources from 'store/resources';
import wfs from 'store/wfs';

const reducers = {
  account,
  accounts,
  admin,
  apiKeys,
  appConfig,
  cloudFunctionStatus,
  cookies,
  eventDefinitions,
  revenueShares,
  device,
  forms,
  global,
  integrationDefinitions,
  notificationStatuses,
  mockedIntegrations,
  oauth,
  opsPayments,
  organization,
  organizations,
  router,
  statements,
  tables,
  termsAndConditions,
  user,
  users,
  validations,
  jobs,
  transactionDetails,
  reportJobs,
  magicLinks,
  resources,
  wfs,
};

export default combineReducers(reducers);
