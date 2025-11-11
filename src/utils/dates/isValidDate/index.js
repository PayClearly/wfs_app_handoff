// Third Party Imports ...

// import Utils from 'utils';

function utils_dates_isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

export default utils_dates_isValidDate;



