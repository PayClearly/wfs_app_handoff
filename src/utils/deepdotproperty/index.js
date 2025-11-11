// Third Party Imports ...


function utils_deepdotproperty(obj, ref) {
  const refParams = ref.split('.');
  let data = obj;
  while (refParams.length && data) {
    data = data[refParams.shift()];
  }
  return data || null;
}

export default utils_deepdotproperty;


