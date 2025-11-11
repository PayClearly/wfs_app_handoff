import { api } from 'api/_util/payclearlyapi';
import oAuthApi from 'api/oAuth';
import jwtDecode from 'jwt-decode';

function login(data) {
  return api().post('/auths/login', data);
}

async function oAuthLogin(data = {}, appName = false) {
  if (!appName) { return Promise.reject(new Error('Could not complete authentication, something went wrong')); }
  const { refreshToken, authState, code } = data;
  if (!refreshToken && !authState) { return Promise.reject(new Error(`Could not verify state ${data.state}.`)); }

  const oAuthResponse = refreshToken ? await oAuthApi.fetchAccessTokenUsingRefreshToken(refreshToken, appName)
    : await oAuthApi.fetchAccessTokenUsingAuthorizationCode(authState.verifier, code, authState.redirectURI, appName);

  let rolesByApp;
  switch (appName) {
    case 'wfsappDEV':
    case 'wfsappDEVTest':
    case 'wfsappPROD':
      rolesByApp = ['myWorldWallet:GeneralUser', 'myWorldWallet:PremiumUser'];
      break;
    case 'wfsDEV':
    case 'wfsPROD':
      rolesByApp = [
        'myWorldCard:WFSAdministrator',
        'myWorldCard:CustomerAdministrator',
        'myWorldCard:CustomerCardholder',
      ];
      break;
    default:
      throw new Error('Something unexpected occurred, this sign in method is not supported');
  }

  const decodedToken = jwtDecode(oAuthResponse.data.access_token);
  if (
    !decodedToken['https://wfscorp.com/custom-claims'].roles
    || decodedToken['https://wfscorp.com/custom-claims'].roles.filter((role) => rolesByApp.includes(role)).length === 0
  ) {
    throw new Error('Access denied');
  }
  const response = await api().post(
    '/auths/login',
    {
      provider: 'auth0',
      accessToken: oAuthResponse.data.access_token,
      appName,
    }
  );
  return { jwt: (response.data || {}).jwt, oAuth: oAuthResponse.data };
}

function logout() {
  return api().post('/auths/logout', {});
}

async function refresh(data = {}) {
  // return api().post('/auths/refresh', data);
  return Promise.resolve('Route does not exist');
}

function update(userId, currentPassword, newPassword) {
  return api().post('/auths/resetPassword', {
    userId,
    currentPassword,
    newPassword,
    token: false,
  });
}

function confirmEmail(token, userId, password) {
  return api(null).post('/auths/verifyEmail', {
    userId,
    token,
    password,
  });
}

function resetPasswordRequest(email) {
  return api(null).post('/auths/resetPasswordRequest', { email });
}

function resetPassword(userId, token, password) {
  return api(null).post('/auths/resetPassword', {
    userId,
    token,
    newPassword: password,
  });
}

function logBackIn(jwtId, email, password) {
  return api(null).post('/auths/logBackIn/', {
    jwtId,
    email,
    password,
  });
}

const scope = {
  login,
  oAuthLogin,
  logout,
  refresh,
  update,
  confirmEmail,
  resetPasswordRequest,
  resetPassword,
  logBackIn,
};

export default scope;
