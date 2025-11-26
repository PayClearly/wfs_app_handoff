// Third Party Imports ...

function utils_wfsContextMatch(a = {}, b = {}) {
  if (!a.customerNumber || !b.customerNumber || a.customerNumber !== b.customerNumber) return false;
  if (!a.tailNumber || !b.tailNumber || a.tailNumber !== b.tailNumber) return false;
  return true;
}

export default utils_wfsContextMatch;

