// Third Party Imports ...

function utils_setDeep(toSet, ...rest) {
  if (rest.length <= 2) {
    toSet[rest[0]] = rest[1];
  } else {
    toSet[rest[0]] = toSet[rest[0]] || {};
    utils_setDeep(toSet[rest[0]], ...rest.slice(1));
  }
}

export default utils_setDeep;

