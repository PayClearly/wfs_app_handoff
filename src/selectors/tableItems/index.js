import Utils from 'utils';
import Selectors from 'selectors';

const selectors_tableItems = (tableName, tableKey = 'default', pathToData) => {
  return Utils.cachedSelector('selectors_tableItems', `${tableName}:${tableKey}`,

    state => state.tables[tableName][tableKey],
    state => _getData(pathToData, state),

    (table = {}, dataToFilter = {}) => {
      // Filter the data
      let items = Object.keys(dataToFilter || {});
      const filters = _try(() => Object.values(table.filters), []);
      if (_try(() => filters.length)) {
        items = items.filter((id) => {
          return filters.every((filter) => {
            const filterByKey = filter.key;
            const filterValue = filter.value;
            const type = filter.type;
            const comparator = filter.comparator;

            const item = dataToFilter[id];
            const itemValue = item[filterByKey];
            
            let match = false;
            switch (type) {
              case 'string':
                // i flag in RegExp ignores casing in matching
                if (comparator === 'includes') {
                  const regex = new RegExp(_escapeRegExp(filterValue), 'i');
                  match = _try(() => regex.test(itemValue));
              } else if (comparator === 'excludes') {
                const regex = new RegExp(_escapeRegExp(filterValue), 'i');
                match = _try(() => !regex.test(itemValue));
              } else if (comparator === 'equals') match = filterValue.toLowerCase() === _try(() => itemValue.toLowerCase());
                break;
              case 'number':
                if (comparator === 'equals') match = itemValue === parseFloat(filterValue);
                if (comparator === 'greaterThan') match = itemValue > parseFloat(filterValue);
                if (comparator === 'lessThan') match = itemValue < parseFloat(filterValue);
                break;
              case 'bool':
                if (comparator === 'is') match = !!itemValue === !!filterValue;
                break;
              case 'date':
                if (comparator === 'isBefore') match = itemValue < filterValue;
                if (comparator === 'isAfter') match = itemValue > filterValue;
                break;
              case 'option':
                if (typeof itemValue === 'object') {
                  const objectItemValue = itemValue[filterValue];
                  if (comparator === 'is') {
                    match = !!objectItemValue;
                  } else if (comparator === 'isNot') {
                    match = !objectItemValue;
                  }
                } else {
                  if (comparator === 'is') {
                    match = itemValue === filterValue;
                  } else if (comparator === 'isNot') {
                    match = itemValue !== filterValue;
                  }
                }
                break;
              default:
                break;
            }

            return match;
          });
        });
      }
 
      //  Sort the data
      if (_try(() => table.sort.sortKey)) {
        const sortKey = table.sort.sortKey;
        const orderIn = table.sort.orderIn;
        const secondarySort = table.sort.tieBreakKey;

        let position1 = -1;
        let position2 = 1;
        if (orderIn === 'desc') {
          position1 = 1;
          position2 = -1;
        }
        const tie = 0;

        items.sort((a, b) => {
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

      return items;
    }
  );
};

export default selectors_tableItems;

// Internal Helper Functions ...

function _getData(pathToData, state) {
  const origin = pathToData.split('.')[0];
  if (origin === 'state') {
    const pathInState = pathToData.split('state.')[1];
    return Utils.getNestedProperty(pathInState, state);
  } else if (origin === 'Selectors') {
    let selector = _try(() => pathToData.split('Selectors.')[1].split('(state)')[0]);
    const parameterizedSelector = _try(() => !!selector.split('(')[1]);
    let parameters;
    if (parameterizedSelector) {
      [selector, parameters] = selector.split('(');
      parameters = parameters.split(')')[0].split(',');
    }
    const additionalPath = _try(() => pathToData.split('Selectors.')[1].split('(state)')[1].substring(1));
    const selectorResponse = !parameterizedSelector ? _try(() => Utils.getNestedProperty(selector, Selectors)(state)) : _try(() => Utils.getNestedProperty(selector, Selectors)(...parameters)(state));
    return additionalPath ? _try(() => Utils.getNestedProperty(additionalPath, selectorResponse)) : selectorResponse;
  }

  return null;
}

function _escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

