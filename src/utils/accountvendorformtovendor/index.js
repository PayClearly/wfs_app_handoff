// Third Party Imports ...


function utils_accountvendorformtovendor(formValues, globalVendors) {

  const payClearlyVendorId = ((name) => {
    const vendor = Object.values(globalVendors).find(item => item.name === name) || {};
    return vendor._id || null;
  })(formValues.payClearlyVendor);

  const vendorData = {
    ...formValues,
    globalVendorRef: payClearlyVendorId || null,
    vCardFee: formValues.vCardFee ?
      {
        type: formValues.vCardFeeType,
        value: Number(parseFloat(formValues.vCardFeeValue).toFixed(2)),
      }
      : null,
  };

  return vendorData;
}

export default utils_accountvendorformtovendor;


