// Third Party Imports ...

function utils_wfsContextAvailable(context = {}, contextsAvailable = {}) {
  if (!context.customerNumber || !context.tailNumber) return false;
  if (!contextsAvailable[context.customerNumber] || !contextsAvailable[context.customerNumber].includes(context.tailNumber)) return false;
  return true;
}

export default utils_wfsContextAvailable;

