const defaultTableState = {
  filters: {},
  sort: {
    sortKey: null,
    orderIn: 'asc',
    tieBreakKey: null,
  },
  pagination: {},
};

export function _tableReducer(state = defaultTableState, action) {
  let stateDiff = {};

  switch (action.type) {
    case 'TABLE_INITIALIZE':
      stateDiff = {};
      if (_try(() => action.data.tableData.filters)) {
        const validFilters = {};
        Object.keys(action.data.tableData.filters).forEach((filterKey) => {
          const initialFilter = action.data.tableData.filters[filterKey];
          const hasKey = initialFilter.key;
          const hasType = initialFilter.type;
          const hasComparator = initialFilter.comparator;
          const hasValue = _try(() => Object.prototype.hasOwnProperty.call(initialFilter, 'value'));
          if (hasKey && hasType && hasComparator && hasValue) validFilters[filterKey] = initialFilter;
        });
        stateDiff.filters = validFilters;
      }
      if (_try(() => action.data.tableData.sort)) stateDiff.sort = action.data.tableData.sort;

      return { ...state, ...stateDiff };
    case 'TABLE_ADD_FILTER':
      stateDiff = {};
      stateDiff.filters = { ...state.filters };
      // Check if exact same filter already exists, and just return original state if it does
      if (Object.values(stateDiff.filters).find(filter => filter.key === action.data.filterData.key && filter.type === action.data.filterData.type && filter.comparator === action.data.filterData.comparator && filter.value === action.data.filterData.value)) return state;
      stateDiff.filters[action.data.filterData.id] = { key: action.data.filterData.key, type: action.data.filterData.type, comparator: action.data.filterData.comparator, value: action.data.filterData.value };
      return { ...state, ...stateDiff };
    case 'TABLE_REMOVE_FILTER':
      stateDiff = {};
      stateDiff.filters = { ...state.filters };
      delete stateDiff.filters[action.data.id];
      return { ...state, ...stateDiff };
    case 'TABLE_RESET_FILTERS':
      stateDiff = {};
      stateDiff.filters = {};
      return { ...state, ...stateDiff };
    case 'TABLE_CHANGE_SORT':
      stateDiff = {};
      stateDiff.sort = { ...state.sort };
      stateDiff.sort.sortKey = action.data.sortData.sortKey;
      stateDiff.sort.tieBreakKey = action.data.sortData.tieBreakKey || null;
      if (action.data.sortData.sortKey === state.sort.sortKey) stateDiff.sort.orderIn = state.sort.orderIn === 'asc' ? 'desc' : 'asc';
      return { ...state, ...stateDiff };
    case 'TABLE_CHANGE_PAGINATION':
      stateDiff = {};
      stateDiff.pagination = { ...state.pagination };

      if (Object.prototype.hasOwnProperty.call(action.data.paginationData, 'currentPage')) stateDiff.pagination.currentPage = action.data.paginationData.currentPage;
      if (Object.prototype.hasOwnProperty.call(action.data.paginationData, 'rowsPerPage')) stateDiff.pagination.rowsPerPage = action.data.paginationData.rowsPerPage;

      return { ...state, ...stateDiff };
    default:
      return state;
  }
}

export function _tableKeyReducer(state = {}, action) {
  let stateDiff = {};

  switch (action.type) {

    case 'TABLE_INITIALIZE':
    case 'TABLE_ADD_FILTER':
    case 'TABLE_REMOVE_FILTER':
    case 'TABLE_RESET_FILTERS':
    case 'TABLE_CHANGE_SORT':
    case 'TABLE_CHANGE_PAGINATION':
      stateDiff = {};
      stateDiff[action.data.tableKey] = _tableReducer(state[action.data.tableKey], action);
      return { ...state, ...stateDiff };
    case 'TABLE_DESTROY':
      stateDiff = { ...state };
      delete stateDiff[action.data.tableKey];
      return stateDiff;
    default:
      return state;
  }
}
export function reducer(state = {}, action) {

  let stateDiff = {};

  switch (action.type) {

    case 'TABLE_INITIALIZE':
    case 'TABLE_DESTROY':
    case 'TABLE_ADD_FILTER':
    case 'TABLE_REMOVE_FILTER':
    case 'TABLE_RESET_FILTERS':
    case 'TABLE_CHANGE_SORT':
    case 'TABLE_CHANGE_PAGINATION':
      stateDiff = {};
      stateDiff[action.data.tableName] = _tableKeyReducer(state[action.data.tableName], action);
      return { ...state, ...stateDiff };
    default:
      return state;
  }
}

export default reducer;

export function initialize(tableName, tableKey, tableData) {
  return { type: 'TABLE_INITIALIZE', data: { tableName, tableKey, tableData } };
}

export function destroy(tableName, tableKey) {
  return { type: 'TABLE_DESTROY', data: { tableName, tableKey } };
}

export function addFilter(tableName, tableKey, filterData) {
  return { type: 'TABLE_ADD_FILTER', data: { tableName, tableKey, filterData } };
}

export function removeFilter(tableName, tableKey, filterId) {
  return { type: 'TABLE_REMOVE_FILTER', data: { tableName, tableKey, id: filterId } };
}

export function resetFilters(tableName, tableKey) {
  return { type: 'TABLE_RESET_FILTERS', data: { tableName, tableKey } };
}

export function changeSort(tableName, tableKey, sortData) {
  return { type: 'TABLE_CHANGE_SORT', data: { tableName, tableKey, sortData } };
}

export function changePagination(tableName, tableKey, paginationData) {
  return { type: 'TABLE_CHANGE_PAGINATION', data: { tableName, tableKey, paginationData } };
}

