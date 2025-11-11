const isObject = (object) => {
  return object != null && typeof object === "object";
};

const utils_isDeepEqual = (object1, object2) => {
  const objKeys1 = Object.keys(object1);
  const objKeys2 = Object.keys(object2);
  let areEqual = true;

  if (objKeys1.length !== objKeys2.length) {
    return false;
  }

  areEqual = objKeys1.forEach((key) => {
    const value1 = object1[key];
    const value2 = object2[key];

    const areObjects = isObject(value1) && isObject(value2);
    if ((areObjects && !utils_isDeepEqual(value1, value2)) || (!areObjects && value1 !== value2)) {
      return false;
    }
  });

  return areEqual;
};

export default utils_isDeepEqual;
