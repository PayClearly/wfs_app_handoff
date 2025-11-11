import createSelector from 'selector';


import Utils from 'utils';
import Selectors from 'selectors';

const selectors_plasticCardForms = () => {

  const selectors = window.selectorCache.selectors_plasticCardForm || {};
  const ids = Object.keys(selectors);

  const states = ids.map((id) => {
    return (state) => { return { [id]: Selectors.plasticCardForm(id)(state) }; };
  });

  return Utils.cachedSelector('selectors_plasticCardForms', ids.join('-'),
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

export default selectors_plasticCardForms;


