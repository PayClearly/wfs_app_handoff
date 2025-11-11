// Third Party Imports ...


function utils_dates_dateToDay(at, format) {
  let timestamp = at;
  if (typeof at === 'string') {
    timestamp = parseInt(at, 10);
  }

  if (typeof at === 'object') {
    timestamp = _try(() => at.getTime(), 0);
  }

  if (timestamp < 1500000000) return 'Unknown';
  const date = new Date(timestamp);

  const dd = _formatLessThanTen(date.getDate());
  const mm = _formatLessThanTen(date.getMonth() + 1);
  const yyyy = date.getFullYear();

  let hour;
  let formattedHour;
  let period;
  let minutes;
  let seconds;

  switch (format) {
    case 'dateFormatUS':
      return `${mm}-${dd}-${yyyy}`;
    case 'dateSlashFormatUS':
      return `${mm}/${dd}/${yyyy}`;
    case 'validThroughDay':
      return `${yyyy}${mm}${dd}`;
    case 'dayOnly':
      return `${yyyy}-${mm}-${dd}`;
    case 'mm-dd-yyyy':
      return `${mm}-${dd}-${yyyy}`;
    case 'UTCDayOnly':
      return `${date.getUTCFullYear()}-${_formatLessThanTen(date.getUTCMonth() + 1)}-${_formatLessThanTen(date.getUTCDate())}`;
    case 'expenseReportName':
      return `${mm}-${dd}-${yyyy} ${date.toLocaleTimeString('en-US', { timeZoneName: 'short' })}`;
    case 'returnFile': // return files are generated on-demand from batch history table (PS21, APReturn, etc);
      hour = _formatLessThanTen(date.getHours());
      minutes = _formatLessThanTen(date.getMinutes());
      return `${yyyy}${mm}${dd}${hour}${minutes}`;
    case 'dayAndMilitaryTime':
      hour = date.getHours();
      minutes = _formatLessThanTen(date.getMinutes());
      return `${mm}-${dd}-${yyyy} | ${hour}:${minutes}`;
    case 'dayAndTimeSlash':
      hour = date.getHours();
      formattedHour = hour > 12 ? hour - 12 : hour;
      period = hour > 11 ? 'PM' : 'AM';
      minutes = _formatLessThanTen(date.getMinutes());
      return `${mm}/${dd}/${yyyy} | ${formattedHour}:${minutes}${period}`;
    case 'dayAndTime':
    default:
      hour = date.getHours();
      formattedHour = hour > 12 ? hour - 12 : hour;
      period = hour > 11 ? 'PM' : 'AM';
      minutes = _formatLessThanTen(date.getMinutes());
      return `${mm}-${dd}-${yyyy} | ${formattedHour}:${minutes}${period}`;
  }
}

export default utils_dates_dateToDay;

// Internal Helper Functions ...
function _formatLessThanTen(time) {
  return time < 10 ? `0${time}` : time;
}

