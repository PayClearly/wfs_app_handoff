/* eslint no-param-reassign:0 */
/* eslint no-return-assign:0 */
/* eslint no-undef:0 */
/* eslint no-shadow:0 */
/* eslint no-mixed-operators:0 */

import browserPlugin from 'router5/plugins/browser';
import listenersPlugin from 'router5/plugins/listeners';
import persistentParams from 'router5/plugins/persistentParams';
import { createRouter } from 'router5';
import { actions as router5actions, router5Middleware, router5Reducer } from 'redux-router5';
import path from 'path';

// router instance
let router;

const modalsDefaultState = [];

const toastDefaultState = {
  show: false,
  name: '',
  data: {},
};

// actionTypes
const START = '@@router/START';
const OPEN_NO_AUTH = 'ROUTER_OPEN_NO_AUTH';
const CLOSE_NO_AUTH = 'ROUTER_CLOSE_NO_AUTH';
const OPEN_MODAL = 'ROUTER_OPEN_MODAL';
const CLOSE_MODAL = 'ROUTER_CLOSE_MODAL';
const SET_MODAL_TAB = 'ROUTER_SET_MODAL_TAB';
const SET_NO_SCROLL = 'ROUTER_SET_NO_SCROLL';
const OPEN_TOAST = 'ROUTER_OPEN_TOAST';
const CLOSE_TOAST = 'ROUTER_CLOSE_TOAST';
const END_TOAST_LIFECYCLE = 'ROUTER_END_TOAST_LIFECYCLE';
const TOGGLE_CARD_ENLARGED = 'ROUTER_TOGGLE_CARD_ENLARGED';

function reducer(state, action) {
  let stateDiff = {};
  switch (action.type) {

    case START:
      return router5Reducer({

        initialRoute: state.route,
        routes: action.routes,
        modals: modalsDefaultState,
        toast: toastDefaultState,
        resourceNameToOverview: action.resourceNameToOverview,

        notAuthed: false,
        cardExpanded: null,
        noScroll: false,
        started: true,

        local: action.local,
        referrer: action.referrer,
        host: action.host,
        protocol: action.protocol,
        baseUrl: `${action.protocol}://${action.host}`,
        
        ...state,

      }, action);

    case OPEN_MODAL:
      stateDiff = {
        modals: [...state.modals],
      };
      stateDiff.modals.unshift({ name: action.name, data: action.data });
      return { ...state, ...stateDiff };

    case CLOSE_MODAL:
      if (!action.name) {
        stateDiff = {
          modals: [...state.modals],
        };
        stateDiff.modals.shift();
      } else {
        stateDiff = {
          modals: state.modals.filter((modal) => modal.name !== action.name),
        };
      }
      return { ...state, ...stateDiff };

    case OPEN_NO_AUTH:
      return { ...state, notAuthed: true };

    case CLOSE_NO_AUTH:
      return { ...state, notAuthed: false };

    case OPEN_TOAST:
      return { ...state, toast: { show: true, name: action.name, data: action.data } };

    case END_TOAST_LIFECYCLE:
      return { ...state, toast: { ...state.toast, show: false } };

    case CLOSE_TOAST:
      return { ...state, toast: toastDefaultState };

    case SET_MODAL_TAB:
      if (_try(() => state.modals[0])) {
        stateDiff = {
          modals: [...state.modals],
        };
        stateDiff.modals[0] = { ...stateDiff.modals[0] };
        stateDiff.modals[0].tab = action.tab;
      }
      return { ...state, ...stateDiff };

    case SET_NO_SCROLL:
      return { ...state, noScroll: action.data };

    case TOGGLE_CARD_ENLARGED:
      return { ...state, cardExpanded: action.data };

    default:
      return router5Reducer(state, action);
  }

}

export default reducer;

// Action Creators //////////////////////////////////////////////////////////////////////////////////
/**
 * @function Router/init
 * @description initilizes the router duck
 * @memberOf State
 * @returns {State.Thunk}
 * @instance
*/
export function init(url) {
  return (dispatch) => dispatch({ type: START, url });
}

/**
 * @function Router/navigateTo
 * @description navigates to the specified route
 * @memberOf State
 * @param {string} routeName
 * @param {object} routeParams
 * @param {object} routeOptions
 * @returns {State.Thunk}
 * @instance
*/
export function navigateTo(routeName, routeParams = {}, routeOptions = {}) {
  return (dispatch) => dispatch(router5actions.navigateTo(routeName, routeParams, routeOptions));
}

/**
 * @function Router/exitTo
 * @description route to a path on the same tab, leaving the application
 * @memberOf State
 * @param {string} full location where you wish to go!
 * @returns {State.Thunk}
 * @instance
*/
export function exitTo(to) {
  return () => window.location.href = to;
}

/**
 * @function Router/removeQueryParams
 * @description removes the specified query params
 * @memberOf State
 * @param {string[]} paramsToRemove
 * @returns {State.Thunk}
 * @instance
*/
export function removeQueryParams(paramsToRemove = []) {
  return (dispatch, getState) => {

    const paramsToKeep = { ...getState().router.route.params };

    paramsToRemove.forEach((param) => {
      if (paramsToKeep[param]) {
        delete paramsToKeep[param];
      }
    });

    dispatch(navigateTo(getState().router.route.name, paramsToKeep));
  };
}

export function setQueryParams(newParams = {}) {
  return (dispatch, getState) => {
    const { name, params } = getState().router.route;
    return navigateTo(name, { ...params, ...newParams })(dispatch, getState);
  };
}

export function setSearchQueryParams(newParams = {}) {
  return (dispatch, getState) => {
    const { name } = getState().router.route;
    return navigateTo(name, newParams)(dispatch, getState);
  };
}

/**
 * @function Router/openToast
 * @description pop open a toast
 * @memberOf State
 * @param {string} path
 * @param {object} data
 * @returns {State.Thunk}
 * @instance
*/
export function openToast(path, data = {}) {
  return (dispatch, getState) => {
    const isOpen = getState().router.toast.show;
    if (isOpen) {
      // nested setTimeouts are far from optimal, but if anyone can find a better solutino then by all means change this.
      // Its done this way so the toast will jump off the screen if it is re initialized while still open. without ending its lifecycle first it just derenders
      dispatch({ type: END_TOAST_LIFECYCLE });
      setTimeout(() => {
        dispatch({ type: CLOSE_TOAST });
        setTimeout(() => {
          dispatch({ type: OPEN_TOAST, name: path, data });
        }, 150);
      }, 250);
    } else {
      dispatch({ type: OPEN_TOAST, name: path, data });
    }
  };
}

/**
 * @function Router/closeToast
 * @description close a toast
 * @memberOf State
 * @returns {State.Thunk}
 * @instance
*/
export function closeToast() {
  return (dispatch, getState) => {
    dispatch({ type: END_TOAST_LIFECYCLE });
    setTimeout(() => {
      dispatch({ type: CLOSE_TOAST });
    }, 350);
  };
}

/**
 * @function Router/openModal
 * @description route to a path on the same tab, leaving the application
 * @memberOf State
 * @param {string} path
 * @param {object} data
 * @returns {State.Thunk}
 * @instance
*/
export function openModal(path, data = {}) {
  return (dispatch, getState) => {
    dispatch({ type: OPEN_MODAL, name: path, data });
  };
}

export function toggleCardEnlarged(data) {
  return (dispatch) => {
    dispatch({ type: TOGGLE_CARD_ENLARGED, data });
  };
}

/**
 * @function Router/openNotAuthed
 * @description route to a path on the same tab, leaving the application
 * @memberOf State
 * @returns {State.Thunk}
 * @instance
*/
export function openNotAuthed() {
  return (dispatch, getState) => {
    const state = getState();
    if (_try(() => !state.wfs.data.preferences.useBiometrics)) { return; }
    dispatch({ type: OPEN_NO_AUTH });
  };
}
/**
 * @function Router/openNotAuthed
 * @description route to a path on the same tab, leaving the application
 * @memberOf State
 * @returns {State.Thunk}
 * @instance
*/
export function closeNotAuthed() {
  return (dispatch, getState) => {
    dispatch({ type: CLOSE_NO_AUTH });
  };
}


/**
 * @function Router/closeModal
 * @description route to a path on the same tab, leaving the application
 * @memberOf State
 * @returns {State.Thunk}
 * @instance
*/
export function closeModal(name = '') {
  return (dispatch, getState) => {
    dispatch({ type: CLOSE_MODAL, name });
  };
}

/**
 * @function Router/setModalTab
 * @description route to a path on the same tab, leaving the application
 * @memberOf State
 * @param {string} tab
 * @returns {State.Thunk}
 * @instance
*/
export function setModalTab(tab = '') {
  return { type: SET_MODAL_TAB, tab };
}

// Middleware //////////////////////////////////////////////////////////////////////////////////
export function routerMiddleware(state, store, routerConfig) {

  const queryString = routerConfig.queryParams
    .reduce((acc, cur, index, all) => acc + ((index === 0) ? ('?:') : ('')) + cur + ((all.length - 1 > index) ? ('&:') : ('')), '');
  const { persistantQueryParams } = routerConfig;

  const routes = routerConfig.routes.map((route) => {
    const children = route.children && route.children.map((childRoute) => ({ name: childRoute.name, path: path.join('/', childRoute.path, queryString) }));
    return ({ name: route.name, path: path.join('/', route.path, queryString), children });
  });

  const { resourceNameToOverview } = routerConfig;

  router = createRouter(routes, {
    defaultRoute: 'error404',
    trailingSlash: true,
    strictQueryParams: false,
  })
    .setDependencies(store)
    .usePlugin(listenersPlugin({}))
    .usePlugin(persistentParams(persistantQueryParams))
    .usePlugin(browserPlugin({
      useHash: false,
    }));

  return [
    () => (next) => (action) => {

          let referrer = '';
          let host = '';
          let protocol = '';
          let local = false;
          if (action.type === START) {

            referrer = document && document.referrer || '';
            host = window && (window.location.href.split('://')[1].split('/')[0]) || '';
            protocol = window && (window.location.href.split('://')[0]);
            local = !!(host.indexOf('.localdev:') > -1); // toplevel domains means the app is running locally

            router.start();
            return next({
              ...action,
              routes,
              referrer,
              host,
              protocol,
              local,
              resourceNameToOverview,
            });
          }
          return next({ ...action });

        },
    router5Middleware(router),
  ];

}
