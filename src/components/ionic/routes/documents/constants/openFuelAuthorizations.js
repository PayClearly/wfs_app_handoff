export const OFA_STRING = 'openFuelAuthorizations';
export const OFA_DISPLAY = 'Fuel Auths';
export const OFA_FILTER_OPTIONS = {
  dateDirection: ['Past', 'Upcoming'],
  dateRange: ['All', '1d', '1w', '2w', '1m', '3m', '6m', '1y'],
  dateOrder: ['Newest', 'Oldest'],
};

export const DEFAULT_OFA_FILTERS = {
  dateDirection: 'Upcoming',
  dateRange: '3m',
  dateOrder: 'Newest',
};

export const OFA_FILTERS_TO_DISPLAY_NAMES = {
  'Search': 'dateDirection',
  'dateDirection': 'Search',
  'Within': 'dateRange',
  'dateRange': 'Within',
  'Sort by': 'dateOrder',
  'dateOrder': 'Sort by',
};

// };

// };