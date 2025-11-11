export const DOC_STRING = 'serviceProviderDocuments';
export const DOC_DISPLAY = 'Receipts';

export const DOC_FILTER_OPTIONS = {
  dateRange: ['1d', '1w', '2w', '1m', '3m', '6m', '1y'],
  dateOrder: ['Newest', 'Oldest'],
};

export const DEFAULT_DOC_FILTERS = {
  dateRange: '3m',
  dateOrder: 'Newest',
};

export const DOC_FILTERS_TO_DISPLAY_NAMES = {
  'Within the Past': 'dateRange',
  dateRange: 'Within the Past',
  'Sort by': 'dateOrder',
  dateOrder: 'Sort by',
};

// export const DOC_SORT_OPTIONS = {
//   dateOrder: ['Newest', 'Oldest'],
// };

// export const DEFAULT_DOC_SORT = {
//   dateOrder: 'Newest',
// };
