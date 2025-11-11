export const SO_STRING = 'salesOrders';
export const SO_DISPLAY = 'Sales Orders';

export const SO_FILTER_OPTIONS = {
  dateDirection: ['Past', 'Upcoming'],
  dateRange: ['1d', '1w', '2w', '30d', '60d', '90d'],
  dateOrder: ['Newest', 'Oldest'],
};

export const DEFAULT_SO_FILTERS = {
  dateDirection: 'Upcoming',
  dateRange: '30d',
  dateOrder: 'Newest',
};

export const SO_FILTERS_TO_DISPLAY_NAMES = {
  'Search': 'dateDirection',
  dateDirection: 'Search',
  'Within': 'dateRange',
  dateRange: 'Within',
  'Sort by': 'dateOrder',
  dateOrder: 'Sort by',
};

// };

// };