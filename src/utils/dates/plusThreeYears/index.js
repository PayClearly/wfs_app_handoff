// Third Party Imports ...


function utils_dates_plusThreeYears(timestamp) {
  // does not scrub local time ex: hours/min/seconds
  const date = new Date(timestamp);
  const newYear = date.getFullYear() + 3;
  date.setFullYear(newYear);
  return date;
}

export default utils_dates_plusThreeYears;


