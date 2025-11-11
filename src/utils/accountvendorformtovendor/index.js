// Third Party Imports ...

// import Utils from 'utils';

function utils_accountvendorformtovendor(formValues, globalVendors) {
  /*
  
  accountVendorFormToVendor
  =========================
  
  Helper function to convert accountVendor form values to accountVendor data prior to being sent to API
  
  Expected Parameters
    formValues: state.forms['Components.forms.accountvendor']<id>._values
    globalVendors: state.global.vendors.data.items
  
  */

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


