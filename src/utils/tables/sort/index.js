// Third Party Imports ...

import Utils from 'utils';

function utils_tables_sort(items = [], dataToFilter = {}, sortState = {}) {
  const sortedItems = [...items];
  if (_try(() => sortState.sortKey)) {
    const sortKey = sortState.sortKey;
    const orderIn = sortState.orderIn;
    const secondarySort = sortState.tieBreakKey;

    let position1 = -1;
    let position2 = 1;
    if (orderIn === 'desc') {
      position1 = 1;
      position2 = -1;
    }
    const tie = 0;

    sortedItems.sort((a, b) => {
      const dataA = Utils.getNestedProperty(sortKey, dataToFilter[a], position1);
      const dataB = Utils.getNestedProperty(sortKey, dataToFilter[b], position2);

      if (dataA < dataB) { return position1; }
      if (dataA > dataB) { return position2; }
      if (secondarySort && sortKey !== secondarySort) {
        const colTieBreakerA = Utils.getNestedProperty(secondarySort, dataToFilter[a], position1);
        const colTieBreakerB = Utils.getNestedProperty(secondarySort, dataToFilter[b], position2);
        if (colTieBreakerA < colTieBreakerB) { return position1; }
        if (colTieBreakerA > colTieBreakerB) { return position2; }
      }

      return tie;
    });
  }
  return sortedItems;
}

export default utils_tables_sort;


