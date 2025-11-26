import axios from 'axios';

const tenants = {
  wfsappDEV: {
    clientId: 'OWP3F2PPlGHECug4EWgvhf68hmiLGkkA',
    darkTheme: 'true',
    oAuthAuthorizeEndpoint: 'https://auth.qa.wfscorp.com/authorize',
    oAuthTokenEndpoint: 'https://auth.qa.wfscorp.com/oauth/token',
    oAuthLogoutEndpoint: 'https://auth.qa.wfscorp.com/v2/logout',
    oAuthLogoutRedirect: (logoutConfig) => {
      if (logoutConfig.platform === 'web') {
        if (logoutConfig.local) {
          return 'http://localhost:5005';
        }
        return 'https://qa.myworldwallet.wfscorp.com';
      }
      return 'com.wfscorp.mywallet%3A%2F%2Fcallback';
    },
  },
  wfsappDEVTest: {
    clientId: '1ZRJjYZGG3Z6BECAYqDv2SiZU9JFszz1',
    darkTheme: 'true',
    oAuthAuthorizeEndpoint: 'https://auth.test.wfscorp.com/authorize',
    oAuthTokenEndpoint: 'https://auth.test.wfscorp.com/oauth/token',
    oAuthLogoutEndpoint: 'https://auth.test.wfscorp.com/v2/logout',
    oAuthLogoutRedirect: (logoutConfig) => {
      if (logoutConfig.platform === 'web') {
        if (logoutConfig.local) {
          return 'http://localhost:5005';
        }
        return 'https://qa.myworldwallet.wfscorp.com';
      }
      return 'com.wfscorp.mywallet%3A%2F%2Fcallback';
    },
  },
  wfsappPROD: {
    clientId: 'CHANGE_ME_PROD_CLIENT_ID',
    darkTheme: 'true',
    oAuthAuthorizeEndpoint: 'https://auth.wfscorp.com/authorize',
    oAuthTokenEndpoint: 'https://auth.wfscorp.com/oauth/token',
    oAuthLogoutEndpoint: 'https://auth.wfscorp.com/v2/logout',
    oAuthLogoutRedirect: (logoutConfig) => {
      if (logoutConfig.platform === 'web') {
        return 'https://myworldwallet.wfscorp.com';
      }
      return 'com.wfscorp.mywallet%3A%2F%2Fcallback';
    },
  },
  wfsDEV: {
    clientId: 'CHANGE_ME_DEV_CLIENT_ID',
    darkTheme: 'false',
    oAuthAuthorizeEndpoint: 'https://auth.qa.wfscorp.com/authorize',
    oAuthTokenEndpoint: 'https://auth.qa.wfscorp.com/oauth/token',
    oAuthLogoutEndpoint: 'https://auth.qa.wfscorp.com/v2/logout',
    oAuthLogoutRedirect: (logoutConfig) => {
      if (logoutConfig.local) {
        return 'http://localhost:5005/logout';
      }
      return 'https://qa.myworldcard.wfscorp.com/logout';
    },
  },
  wfsPROD: {
    clientId: 'CHANGE_ME_PROD_CLIENT_ID',
    darkTheme: 'false',
    oAuthAuthorizeEndpoint: 'https://auth.wfscorp.com/authorize',
    oAuthTokenEndpoint: 'https://auth.wfscorp.com/oauth/token',
    oAuthLogoutEndpoint: 'https://auth.wfscorp.com/v2/logout',
    oAuthLogoutRedirect: () => 'https://myworldcard.wfscorp.com/logout',
  },
};

const getAuthorizationCodePath = (appName, authorizeConfig = {}) => {
  // Add code for database or API integrations

  return false;
};

const getLogoutInformation = (appName, logoutConfig = {}) => {
  // Add code for database or API integrations

  return false;
};

const fetchAccessTokenUsingAuthorizationCode = (verifier, authorizationCode, redirectURI, appName) => {
  // Add code for database or API integrations

  return false;
};

const fetchAccessTokenUsingRefreshToken = (refreshToken, appName) => {
  // Add code for database or API integrations

  return false;
};

export default {
  fetchAccessTokenUsingAuthorizationCode,
  fetchAccessTokenUsingRefreshToken,
  getAuthorizationCodePath,
  getLogoutInformation,
};
