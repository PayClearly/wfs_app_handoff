// Third Party Imports ...

// import Utils from 'utils';

function utils_sanitizeString(string = '') {
  return string.toLowerCase().replace(/\s+/g, '');
}

export default utils_sanitizeString;


