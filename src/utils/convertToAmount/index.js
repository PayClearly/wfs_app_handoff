// Third Party Imports ...

function utils_convertToAmount(value) {
  return typeof value === 'string' ?
    Number(parseFloat(value.replace(/,/g, '')).toFixed(2)) :
    Number(parseFloat(value).toFixed(2));
}

export default utils_convertToAmount;

