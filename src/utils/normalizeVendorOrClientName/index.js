/**
 * 
 * @param {string} name 
 */
function utils_normalizeVendorOrClientName(name) {
  return name.replace(/^0+/, '').replace(/[\s]/g, '');
}

export default utils_normalizeVendorOrClientName;