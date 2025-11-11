import React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactRedux from 'react-redux';
import numeral from 'numeral';
import firebase from 'firebase';

import 'assets/static/browser_not_supported.html';

import Components from './components';
import * as Store from './store';

// TODO: remove this placeholder comment

function wrap(app) {

  window.APPLICATIONSTART = (state) => {

    Promise.all([
      checkBrowserSupport(),
      registerNumeral(),
      loadAnalytics(app.config),
      loadGlobalScripts(app.config),
    ]).then(() => {

      const { entry, config } = app;
      const Comps = { entry };

      const { store } = initStore(config, state);

      window.APPLICATIONSTORE = store;
      ReactDOM.render(
        <Components.errorboundary>
          <ReactRedux.Provider store={store}>
            <Comps.entry />
          </ReactRedux.Provider>
        </Components.errorboundary>,
        document.getElementById('root')
      );

    });
  };

  window.APPLICATIONSTATE = () => window.APPLICATIONSTORE.getState() || {};

  function initStore(config, state = {}) {
    const store = Store.configureStore({ ...state, appConfig: { data: config } }, config.router);

    // initial state
    store.dispatch(Store.default.router.init());
    store.dispatch(Store.default.cookies.init());
    store.dispatch(Store.default.device.init());

    window.store = store;

    return { store };
  }

}

module.exports = wrap;

// POLYFILLS and Global Methods

window._resolve = (object, itemsString, fallback) => {
  if (object === undefined || object === null) { return fallback; }
  if (!(itemsString || '').length) { return object; }
  const items = itemsString.split('.');
  return _resolve(object[items[0]], items.slice(1, 10).join('.'), fallback);
};

window._try = (toTry, onErrorReturn) => {
  try {
    const toReturn = toTry();
    if (toReturn === undefined) { return onErrorReturn; }
    return toReturn;
  } catch (e) {
    return onErrorReturn;
  }
};

window._importDirectory = (context) => {
  const obj = {};
  context.keys().forEach((key) => {
    const keysSplit = key.split('/');
    const name = keysSplit[keysSplit.length - 2];
    if (!name || name === '.' || keysSplit.length !== 3) { return; }
    obj[name] = context(key).default;
  });
  return obj;
};

function loadAnalytics(config) {

  if (window.analyticsLoaded) { return; }
  window.analyticsLoaded = true;

  window._analytics = {
    mixpanel: {
      time_event: () => { },
      identify: () => { },
      init: () => { },
      reset: () => { },
      track: () => { },
      people: { set: () => { } },
    },
  };

  if (!config.analytics || window.location.href.includes('local')) { return; }

  // Mixpanel script
  // eslint-disable-next-line
  (function (e, a) { if (!a.__SV) { var b = window; try { var c, l, i, j = b.location, g = j.hash; c = function (a, b) { return (l = a.match(RegExp(b + "=([^&]*)"))) ? l[1] : null }; g && c(g, "state") && (i = JSON.parse(decodeURIComponent(c(g, "state"))), "mpeditor" === i.action && (b.sessionStorage.setItem("_mpcehash", g), history.replaceState(i.desiredHash || "", e.title, j.pathname + j.search))) } catch (m) { } var k, h; window.mixpanel = a; a._i = []; a.init = function (b, c, f) { function e(b, a) { var c = a.split("."); 2 == c.length && (b = b[c[0]], a = c[1]); b[a] = function () { b.push([a].concat(Array.prototype.slice.call(arguments, 0))) } } var d = a; "undefined" !== typeof f ? d = a[f] = [] : f = "mixpanel"; d.people = d.people || []; d.toString = function (b) { var a = "mixpanel"; "mixpanel" !== f && (a += "." + f); b || (a += " (stub)"); return a }; d.people.toString = function () { return d.toString(1) + ".people (stub)" }; k = "disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" "); for (h = 0; h < k.length; h++)e(d, k[h]); a._i.push([b, c, f]) }; a.__SV = 1.2; b = e.createElement("script"); b.type = "text/javascript"; b.async = !0; b.src = "undefined" !== typeof MIXPANEL_CUSTOM_LIB_URL ? MIXPANEL_CUSTOM_LIB_URL : "file:" === e.location.protocol && "//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//) ? "https://cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js" : "//cdn4.mxpnl.com/libs/mixpanel-2-latest.min.js"; c = e.getElementsByTagName("script")[0]; c.parentNode.insertBefore(b, c) } })(document, window.mixpanel || []);
  window.mixpanel.init('07c97b5eb1aa3f322e3dd00df7a4b7ea');
}

function loadGlobalScripts() {
  window.loadedScripts = window.loadedScripts || {};

  firebase.initializeApp(window.GLOBALCERT);

  if (window.GLOBALCERT.cloudFunctions.includes('localhost')) {
    const auth = firebase.auth();
    auth.useEmulator('http://localhost:9099');
    const database = firebase.database();
    database.useEmulator('localhost', 9000);
  }
}

function checkBrowserSupport() {
  const isIE6TO9 = (((!!window.ActiveXObject && +(/msie\s(\d+)/i.exec(window.navigator.userAgent)[1])) || NaN) < 10);
  if (isIE6TO9) { window.location.href = '/src/assets/static/browser_not_supported.html'; }
}

function registerNumeral() {

  if (window.registerNumeral) { return; }
  window.registerNumeral = true;

  numeral.register('locale', 'us', {
    delimiters: {
      thousands: ',',
      decimal: '.',
    },
    abbreviations: {
      thousand: 'K',
      million: 'M',
      billion: 'B',
      trillion: 'T',
    },
    ordinal: (number) => (number === 1 ? 'er' : 'ème'),
    currency: {
      symbol: '$',
    },
  });

  numeral.locale('us');
}
