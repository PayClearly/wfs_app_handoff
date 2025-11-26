// Third Party Imports ...

import Utils from 'utils';

function utils_snakeCaseToCapitalCase(str) {
  if (!str || typeof str !== 'string') return;
  return _try(() => Utils.capitalize(str.replace(/[A-Z]/g, n => ` ${n}`)), str);
}

export default utils_snakeCaseToCapitalCase;

