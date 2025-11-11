function sortCaret(order) {
  if (order === 'asc') { return (<>&nbsp;<i className={'mdi mdi-chevron-down'} /></>); }
  if (order === 'desc') { return (<>&nbsp;<i className={'mdi mdi-chevron-up'} /></>); }
  return (<>&nbsp;<i className={'mdi mdi-chevron-up'} /><i className={'mdi mdi-chevron-down'} /></>);
}

function formatCurrency(amount) {
  try {
    const negativeSign = amount < 0 ? '-' : '';
    const i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(2), 10).toString();
    const j = (i.length > 3) ? i.length % 3 : 0;

    return `${negativeSign}$${j ? `${i.substring(0, j)},` : ''}${i.substring(j).replace(/(\d{3})(?=\d)/g, '$1,')}.${Math.abs(amount - i).toFixed(2).slice(2)}`;
  } catch (e) {
    console.log('error formatting currency', e);
    return null;
  }
}

function getDateString(string) {
  if (!string) { return ''; }
  return `${new Date(`${string.slice(0, 4)}/${string.slice(4, 6)}/${string.slice(6)}`).toISOString().split('T')[0]}`;
}

function sortNumbers(a, b, order) {
  if (order === 'asc') { return parseFloat(a) - parseFloat(b); } // desc
  return parseFloat(b) - parseFloat(a);
}

function sortDates(a, b, order) {
  const parsedA = Number.isNaN(new Date(getDateString(a)).getTime()) ? 0 : new Date(getDateString(a)).getTime();
  const parsedB = Number.isNaN(new Date(getDateString(b)).getTime()) ? 0 : new Date(getDateString(b)).getTime();
  if (order === 'asc') { return parseFloat(parsedA) - parseFloat(parsedB); } // desc
  return parseFloat(parsedB) - parseFloat(parsedA);
}

function getEndDate() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function getStartDate() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}
  
export {
  sortCaret,
  formatCurrency,
  getDateString,
  sortNumbers,
  sortDates,
  getEndDate,
  getStartDate,
};
