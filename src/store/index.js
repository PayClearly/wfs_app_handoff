import { createStore, applyMiddleware } from 'redux';

import Utils from 'utils';
import { routerMiddleware } from 'store/router';

import reducer from 'store/reducer';

export function configureStore(initialState, routerConfig) {

  let store;
  const middleware = applyMiddleware(thunk, ...routerMiddleware(initialState, () => { return store; }, routerConfig));
  store = createStore(reducer, initialState, middleware);

  window._dispatch = store.dispatch;
  window._dispatch.id = Date.now();
  store.dispatch = (action) => {
    window._dispatch(action);
  };

  function thunk({ dispatch, getState }) {
    return function wrapDispatch(next) {
      return function handleAction(action) {
        if (typeof action === 'function') {
          return action(store.dispatch, getState);
        }
        return next(action);
      };
    };
  }
  return store;
}

const context = require.context('.', true, /\.js$/);
export default _importNestedDirectory(context);

function _importNestedDirectory(context) {
  const obj = {};
  context.keys().forEach((key) => {
    const keysSplit = key.split('/');
    const name = keysSplit[keysSplit.length - 2];
    if (!name || name === '.' || name[0] === '_') return; // return if does not match structure
    const defaultMod = keysSplit.filter((key) => {
      return key !== '.' && key !== 'index.js';
    });
    defaultMod.push(context(key));
    Utils.setDeep(obj, ...defaultMod);
  });
  return obj;
}
