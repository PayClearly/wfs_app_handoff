import createSelector from 'selector';

// Third Party Imports ...

import Utils from 'utils';
import Selectors from 'selectors';

const selectors_paymentforms = () => {

  const selectors = window.selectorCache.selectors_paymentform || {};
  const ids = Object.keys(selectors);

  const states = ids.map((id) => {
    return (state) => { return { [id]: Selectors.paymentform(id)(state) }; };
  });
  return Utils.cachedSelector('selectors_paymentforms', ids.join('-'),
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

export default selectors_paymentforms;

