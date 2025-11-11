export const DEFAULT_SEARCH_RADIUS = 10;
export const TODAY_VALUE = '0d';


export const DATE_ORDER_MAPPING = {
  'Newest': 'DESC',
  'Oldest': 'ASC',
};

export const FILTER_SORT_DISPLAY = {
  'Within the Past': 'dateRange',
  'dateRange': 'Within the Past',
  'withinRange': 'Within the Past',
  'Sort by': 'dateOrder',
  'sortBy': 'Sort by',
  'Search': 'withinRange',
  // 'withinRange': 'Search',
  'Within': 'within',
  'within': 'Within',
};

export const ORDER_DISPLAY = {
  ASC: 'Oldest',
  Oldest: 'ASC',
  DESC: 'Newest',
  Newest: 'DESC',
};
export const TYPE_TO_DISPLAY = {
  openFuelAuthorizations: 'OFA',
  salesOrders: 'SO',
  serviceProviderDocuments: 'DOC',
};

export const DATE_DIRECTION_DISPLAY = {
  'Upcoming': 'future',
  'Past': 'past',
};