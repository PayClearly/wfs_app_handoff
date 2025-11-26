import createSelector from 'selector';

import Utils from 'utils';
import Selectors from 'selectors';

const selectors_uploaders_clientVendorLinkForms = () => {

  const selectors = window.selectorCache.selectors_uploaders_clientVendorLinkForm || {};
  const ids = Object.keys(selectors);

  const states = ids.map((id) => {
    return (state) => { return { [id]: Selectors.uploaders.clientVendorLinkForm(id)(state) }; };
  });

  return Utils.cachedSelector('selectors_uploaders_clientVendorLinkForms', ids.join('-'),
    ...states,
    (...items) => {
      return items.reduce((acc, item) => {
        return {
          ...acc,
          ...item,
        };
      }, {});
    }
  );

};

export default selectors_uploaders_clientVendorLinkForms;

