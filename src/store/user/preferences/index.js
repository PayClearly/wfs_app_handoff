import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';

import UserAPI from 'api/user';

const namespace = 'USERPREFERENCES';
export const actionTypes = createActionTypes(namespace);

export const defaultState = {
  paths: {},
  item: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      return {
        ...state,
        item: { ...action.data },
        paths: { ...state.paths, ...action.paths },
      };

    default:
      return state;

  }
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});
export default reducer;

// action creators
export function sync(userId) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchValue(`state/userPreferences/${userId}`, (data, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data, paths });

      // when the user is synced to the store we want to update the application to their preferred theme,
      // the preferences object is not guarenteed to exist, however.
      const stylePreference = (data && data.darkMode) ? 'dark' : 'light';

      const styles = getState().appConfig.data.styles[stylePreference];
      const root = document.documentElement;
      Object.keys(styles).forEach((style) => {
        root.style.setProperty(style, styles[style]);
        root.dataset.theme = stylePreference;
      });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().user.preferences.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function update(uid, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return UserAPI.updatePreferences(uid, data)
      .then(() => {
        dispatch({ type: actionTypes.updateSuccess, data: {}, paths: {} });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.updateError, error: error.response.data.error });
      });
  };
}
