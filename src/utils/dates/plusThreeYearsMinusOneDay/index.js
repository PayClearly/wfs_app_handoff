// Third Party Imports ...

import Utils from 'utils';

function utils_dates_plusThreeYearsMinusOneDay(timestamp) {
  const date = Utils.dates.plusThreeYears(timestamp);
  date.setDate(date.getDate() - 1);
  return date;
}

export default utils_dates_plusThreeYearsMinusOneDay;


