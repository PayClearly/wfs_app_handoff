import { api } from 'api/_util/payclearlyapi';
import oAuthApi from 'api/oAuth';
import jwtDecode from 'jwt-decode';

function login(data) {
  // Add code for database or API integrations

  return false;
}

async function oAuthLogin(data = {}, appName = false) {
  // Add code for database or API integrations

  return false;
}

function logout() {
  // Add code for database or API integrations

  return false;
}

async function refresh(data = {}) {
  // Add code for database or API integrations

  return false;
}

function update(userId, currentPassword, newPassword) {
  // Add code for database or API integrations

  return false;
}

function confirmEmail(token, userId, password) {
  // Add code for database or API integrations

  return false;
}

function resetPasswordRequest(email) {
  // Add code for database or API integrations

  return false;
}

function resetPassword(userId, token, password) {
  // Add code for database or API integrations

  return false;
}

function logBackIn(jwtId, email, password) {
  // Add code for database or API integrations

  return false;
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
