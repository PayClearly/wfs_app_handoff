const context = require.context('.', true, /\.js$/);
export default _importNestedDirectory(context);

function _setDeep(toSet, ...rest) {
  if (rest.length <= 2) {
    toSet[rest[0]] = rest[1];
  } else {
    toSet[rest[0]] = toSet[rest[0]] || {};
    _setDeep(toSet[rest[0]], ...rest.slice(1));
  }
}

function _importNestedDirectory(context) {
  const obj = {};
  context.keys().forEach((key) => {
    const keysSplit = key.split('/');
    const name = keysSplit[keysSplit.length - 2];
    if (!name || name === '.') return; // return if does not match structure
    const defaultMod = keysSplit.filter((key) => {
      return key !== '.' && key !== 'index.js';
    });
    defaultMod.push(context(key).default);
    _setDeep(obj, ...defaultMod);
  });
  return obj;
}

