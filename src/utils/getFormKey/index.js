// Third Party Imports ...


function utils_getFormKey(formProps = {}) {
  return Object.keys(formProps).includes('formKey') ? formProps.formKey : 'default';
}

export default utils_getFormKey;


