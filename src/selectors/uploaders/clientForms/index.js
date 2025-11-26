import createSelector from 'selector';

import Utils from 'utils';
import Selectors from 'selectors';

const selectors_uploaders_clientForms = () => {

  const selectors = window.selectorCache.selectors_uploaders_clientForm || {};
  const ids = Object.keys(selectors);

  const states = ids.map((id) => {
    return (state) => { return { [id]: Selectors.uploaders.clientForm(id)(state) }; };
  });

  return Utils.cachedSelector('selectors_uploaders_clientForms', ids.join('-'),
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

export default selectors_uploaders_clientForms;

