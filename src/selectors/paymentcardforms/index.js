import createSelector from 'selector';


import Utils from 'utils';
import Selectors from 'selectors';

const selectors_paymentcardforms = () => {

  const selectors = window.selectorCache.selectors_paymentcardform || {};
  const ids = Object.keys(selectors);

  const states = ids.map((id) => {
    return (state) => { return { [id]: Selectors.paymentcardform(id)(state) }; };
  });

  return Utils.cachedSelector('selectors_paymentcardforms', ids.join('-'),
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

export default selectors_paymentcardforms;


