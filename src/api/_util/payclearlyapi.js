import axios from 'axios';
import firebase from 'firebase';
import { z } from 'zod';

export function api(idToken, headers) {
  return ['get', 'put', 'patch', 'post', 'delete']
    .reduce((acc, method) => {
      acc[method] = (path, data) => {
        if (idToken || !firebase.auth().currentUser || idToken === null) {
          return _api(idToken, headers)[method](path, data);
        }

        return firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
          .then((token) => _api(token, headers)[method](path, data));
      };
      return acc;
    }, {});
}

export function database(auth) {
  const config = {
    baseURL: window.GLOBALCERT.databaseURL,
    timeout: 60000,
  };

  if (auth) {
    config.params = { auth };
  }

  return {
    get: (path) => axios.create(config).get(`default/${path}`.replace('//', '/')),
  };
}

export const apiErrorSchema = z.object({
  response: z.object({
    data: z.object({
      error: z.string(),
    }),
  }),
});

function _api(auth = 'noauthdefiend', additionalHeaders) {
  const headers = {
    Authorization: `Bearer ${auth}`,
    'X-Cloud-Trace-Context': 'o=1',
    'pc-dbId': 'default',
    ...additionalHeaders,
  };


  const axiosInstance = axios.create({
    baseURL: window.GLOBALCERT.cloudFunctions,
    timeout: 60000,
    headers,
  });

  return {
    ...axiosInstance,
    get: (path, data) => axiosInstance.get(path, data).catch(_errorHandler),
    post: (path, data) => axiosInstance.post(path, data).catch(_errorHandler),
    patch: (path, data) => axiosInstance.patch(path, data).catch(_errorHandler),
    put: (path, data) => axiosInstance.put(path, data).catch(_errorHandler),
    delete: (path, data) => axiosInstance.delete(path, data).catch(_errorHandler),
  };
}

export default api;

function _errorHandler(err) {
  if (_resolve(err.response.data.error.message || err.response.data.error)) {
    const errorMessage = err.response.data.error.message || err.response.data.error;
    const response = { response: { data: { error: errorMessage } } };
    throw response;
  }
  throw err;
}
