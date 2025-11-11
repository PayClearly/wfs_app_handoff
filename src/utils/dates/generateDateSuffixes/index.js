// Third Party Imports ...


function utils_dates_generateDateSuffixes(date) {
  const j = date % 10;
  const k = date % 100;

  if (j === 1 && k !== 11) {
    return 'st';
  } else if (j === 2 && k !== 12) {
    return 'nd';
  } else if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
}

export default utils_dates_generateDateSuffixes;


