/* eslint no-useless-escape:0 */

import createSelector from 'selector';


const selectors_head = createSelector('selectors_head',

  state => state.router,
  state => state.device,
  state => state.appConfig.data.providerTheme,

  (router, device, theme) => {

    const modalShowing = _try(() => router.modals.length);
    const isTouchDevice = device.isTouchDevice;

    return {
      htmlAttributes: {
        lang: 'en',
        'data-country': 'US',
        class: [(modalShowing || router.noScroll) ? 'no-scroll' : '', isTouchDevice ? 'touch' : ''].join(' '),
      },
      base: {},

      title: theme.displayName,
      titleTemplate: '',
      titleAttributes: {},
      defaultTitle: 'WFS',
      link: [

        // Canonical Link
        { rel: 'canonical', href: `https://CHANGE_ME${router.route.path}` },

      ],
      meta: [],
      noscript: [],
      style: [],
    };
  },
);

export default selectors_head;
