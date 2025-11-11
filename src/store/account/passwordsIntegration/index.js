// import { combineReducers } from 'redux';
// import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
// import { watchCollection, watchValue, removeListeners, watchValues } from 'store/_utilities/firebaseHelpers';
// import API_passwordsIntegration from 'api/passwordsIntegration';
// import API_integrationManagement from 'api/integrationManagement';

// const namespace = 'PASSWORDS_INTEGRATION';
// export const actionTypes = createActionTypes(namespace);

// export const defaultState = {
//   paths: {},
//   resources: {
//     asdf: {},
//   },
//   statuses: {
//     asdf: {},
//   },
//   details: {},
//   preferences: {},
//   _resources: {},
// };

// export function _moduleReducers(state = defaultState, action) {
//   switch (action.type) {

//     case actionTypes.clear:
//       return { ...defaultState };

//     case actionTypes.link:
//       return { ...defaultState };

//     case actionTypes.fetchSuccess:
//     case actionTypes.updateSuccess:
//       return {
//         ...state,
//         resources: {
//           ...state.resources,
//           ...(action.resource && { [action.resource]: {
//             ...state.resources[action.resource],
//             ...action.items,
//           } } || {}),
//         },
//         _resources: {
//           ...state._resources,
//           ...(action._resource && { [action._resource]: {
//             ...state._resources[action._resource],
//             ...action.items,
//           } } || {}),
//         },
//         ...(action.name && { [action.name]: {
//             ...state.resources[action.resource],
//             ...action.items,
//           } } || {}),
//         paths: { ...state.paths, ...(action.paths || {}) },
//       };

//     case actionTypes.createSuccess:
//       return {
//         ...state,
//         created: { ...action.data },
//       };

//     default:
//       return state;

//   }
// }

// export const reducer = combineReducers({
//   status: createStatusReducer(namespace),
//   data: _moduleReducers,
// });

// export default reducer;

// // action creators
// export function sync(organizationId, accountId) {
//   console.log('sync passwords')
//   const integration = 'passwordsIntegration';
//   return (dispatch, getState) => {
//     const definition = getState().integrationDefinitions.data.items[integration];
//     console.log('definition', definition);
//     // wait until definition exists
//     if (!definition) {
//       return new Promise(resolve => setTimeout(resolve, 1000))
//       .then(() => {
//         return sync(organizationId, accountId)(dispatch, getState);
//       });
//     }

//     dispatch({ type: actionTypes.fetchStart });
//     return Promise.all(['details', 'preferences', 'metas'].map((name) => {
//         return watchValue(`state/links/${integration}/${organizationId}/${accountId}/${name}`, (items, paths) => {
//           dispatch({ type: actionTypes.updateSuccess, items, paths, name });
//         });
//       }))
//     .then((items) => {
//       dispatch({ type: actionTypes.fetchSuccess });
//     });
//   };
// }

// export function link(organizationId, accountId, data) {
//   return (dispatch, getState) => {
//     dispatch({ type: actionTypes.createStart });
//     return API_passwordsIntegration.link(organizationId, accountId, data)
//     .then((res) => {
//       dispatch({ type: actionTypes.createSuccess, data: res });
//     })
//     .catch((error) => {
//       dispatch({ type: actionTypes.createError, error: 'Failed to link, please reach out to your admin' });
//     });
//   };
// }

// export function unlink(organizationId, accountId, data) {
//   return (dispatch, getState) => {
//     dispatch({ type: actionTypes.updateStart });
//     return API_passwordsIntegration.unlink(organizationId, accountId, data)
//     .then((res) => {
//       dispatch({ type: actionTypes.updateSuccess, data: res });
//     })
//     .catch((error) => {
//       dispatch({ type: actionTypes.updateError, error: error.response.data.error });
//     });
//   };
// }

// export function clearErrors() {
//   return (dispatch) => {
//     dispatch({ type: actionTypes.clearErrors, data: {} });
//   };
// }

// export function retrieveItem(organizationId, accountId, issueType) {
//   return (dispatch, getState) => {
//     dispatch({ type: actionTypes.fetchStart });
//     const ids = getState().account.erpIntegration.data.metas || {};
    
//     let data = {};
//     return Promise.all(Object.keys(ids || {}).map((key) => {
//       return watchValues(`state/links/passwordsIntegration/${organizationId}/${accountId}/links/${key}`, Object.keys(ids[key][issueType.toLowerCase()] || {}), (items, paths) => {
//         data = { ...items, ...data };
//         Object.keys(items || {}).forEach((item) => { data[item].itemType = key; });
//         return data;
//       });
//     }))
//     .then(() => {
//       dispatch({ type: actionTypes.fetchSuccess, items: data, name: 'currentIssues' });
//     })
//     .catch((error) => {
//       dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
//     });
//   };
// }

// export function syncQueue(queue) {
//   return (dispatch, getState) => {
//     dispatch({ type: actionTypes.updateStart });
//     const organizationId = getState().organization.data.id;
//     const accountId = getState().account.data.id;
//     return API_integrationManagement.sync(organizationId, accountId, 'passwordsIntegration', queue)
//     .then((res) => {
//       dispatch({ type: actionTypes.updateSuccess });
//     })
//     .catch((error) => {
//       dispatch({ type: actionTypes.updateError, error: error.response.data.error });
//     });
//   };
// }

// export function clear() {
//   return (dispatch, getState) => {
//     removeListeners(getState().account.erpIntegration.data.paths);
//     dispatch({ type: actionTypes.clear });
//   };
// }
