// Third Party Imports ...


function utils_capitalize(str) {
  if (!str || typeof str !== 'string') return;
  return _try(() => str.charAt(0).toUpperCase() + str.slice(1));
}

export default utils_capitalize;


