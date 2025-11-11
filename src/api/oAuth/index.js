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
          return 'http://wfsapp.payclearly.localdev:5005';
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
          return 'http://wfsapp.payclearly.localdev:5005';
        }
        return 'https://qa.myworldwallet.wfscorp.com';
      }
      return 'com.wfscorp.mywallet%3A%2F%2Fcallback';
    },
  },
  wfsappPROD: {
    clientId: 'khigDfpHOOe254LoZxxPuBocW9GGjHiE',
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
    clientId: 'lBIfJX6h35cDnUymt2cHkZYXOY3QJX6J',
    darkTheme: 'false',
    oAuthAuthorizeEndpoint: 'https://auth.qa.wfscorp.com/authorize',
    oAuthTokenEndpoint: 'https://auth.qa.wfscorp.com/oauth/token',
    oAuthLogoutEndpoint: 'https://auth.qa.wfscorp.com/v2/logout',
    oAuthLogoutRedirect: (logoutConfig) => {
      if (logoutConfig.local) {
        return 'http://wfs.payclearly.localdev:5005/logout';
      }
      return 'https://qa.myworldcard.wfscorp.com/logout';
    },
  },
  wfsPROD: {
    clientId: 'HHXQWqxRZYEHFdiTyxGhLRikMkPQeWcE',
    darkTheme: 'false',
    oAuthAuthorizeEndpoint: 'https://auth.wfscorp.com/authorize',
    oAuthTokenEndpoint: 'https://auth.wfscorp.com/oauth/token',
    oAuthLogoutEndpoint: 'https://auth.wfscorp.com/v2/logout',
    oAuthLogoutRedirect: () => 'https://myworldcard.wfscorp.com/logout',
  },
};

const getAuthorizationCodePath = (appName, authorizeConfig = {}) => {
  const {
    oAuthAuthorizeEndpoint,
    clientId,
    darkTheme,
  } = tenants[appName];
  if (
    !authorizeConfig.scope
    || !authorizeConfig.state
    || !authorizeConfig.challenge
    || !authorizeConfig.redirectURI
  ) {
    throw new Error('Invalid parameters for wfsapp oAuth authorize');
  }

  return `${oAuthAuthorizeEndpoint}?`
    + 'response_type=code&'
    + `scope=${encodeURIComponent(authorizeConfig.scope)}&`
    + `client_id=${clientId}&`
    + 'audience=https%3A%2F%2Fworld-graph.wfscorp.com&'
    + `state=${authorizeConfig.state}&`
    + 'code_challenge_method=S256&'
    + `code_challenge=${authorizeConfig.challenge}&`
    + `redirect_uri=${authorizeConfig.redirectURI}&`
    + `darkTheme=${darkTheme}`;
};

const getLogoutInformation = (appName, logoutConfig = {}) => {
  const tenantInfo = tenants[appName];
  return {
    returnTo: tenantInfo.oAuthLogoutRedirect(logoutConfig),
    clientId: tenantInfo.clientId,
    logoutUrl: tenantInfo.oAuthLogoutEndpoint,
  };
};

const fetchAccessTokenUsingAuthorizationCode = (verifier, authorizationCode, redirectURI, appName) => {
  const {
    oAuthTokenEndpoint,
    clientId,
  } = tenants[appName];

  return axios.post(
    oAuthTokenEndpoint,
    'grant_type=authorization_code&'
      + `code_verifier=${verifier}&`
      + `client_id=${clientId}&`
      + `code=${authorizationCode}&`
      + `redirect_uri=${redirectURI}`,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );
};

const fetchAccessTokenUsingRefreshToken = (refreshToken, appName) => {
  const {
    oAuthTokenEndpoint,
    clientId,
  } = tenants[appName];
  return axios.post(
    oAuthTokenEndpoint,
    'grant_type=refresh_token&'
      + `client_id=${clientId}&`
      + `refresh_token=${refreshToken}`,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );
};

export default {
  fetchAccessTokenUsingAuthorizationCode,
  fetchAccessTokenUsingRefreshToken,
  getAuthorizationCodePath,
  getLogoutInformation,
};
