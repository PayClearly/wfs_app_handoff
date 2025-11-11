// Third Party Imports ...


function utils_getNestedProperty(dotNotatedPropertyString, object, defaultValue) {
  const propertyKeys = dotNotatedPropertyString.split('.');
  let value = object;
  propertyKeys.forEach((propertyKey, index) => {
    value = _try(() => value[propertyKey], defaultValue);
  });

  return value;
}

export default utils_getNestedProperty;


