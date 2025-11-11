import axios from 'axios';
import firebase from 'firebase';
import { z } from 'zod';

export function api(idToken, headers) {
  // Add code for database or API integrations

  return false;
}

export function database(auth) {
  // Add code for database or API integrations

  return false;
}

export const apiErrorSchema = z.object({
  response: z.object({
    data: z.object({
      error: z.string(),
    }),
  }),
});

function _api(auth = 'noauthdefiend', additionalHeaders) {
  // Add code for database or API integrations

  return false;
}

export default api;

function _errorHandler(err) {
  // Add code for database or API integrations

  return false;
}
