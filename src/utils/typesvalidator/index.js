// Third Party Imports ...

// import Utils from 'utils';

function validateSchema(validator, schema, against) {
  const allValid = !Object.keys(schema).some((key) => validateType(validator, schema[key], against[key]).valid === false);

  return {
    valid: allValid,
  };
}

function validateMap(validator, type, against) {

  let keyType = '';
  let valueType = '';
  type.replace(/Map<(.*),\s*(.*)>/, (match, g1, g2) => {
    keyType = g1;
    valueType = g2;
  });

  const allValid = !Object.keys(against).some((key) => (validateType(validator, keyType, key).valid
    && validateType(validator, valueType, against[key]).valid) === false);

  return {
    valid: allValid,
  };
}

function validateType(validator, type, against) {

  // check for multiple types
  const types = type.split(' | ');
  if (types && types.length > 1) {
    return {
      valid: types.some((item) => validateType(validator, item, against).valid),
    };
  }

  if (type === 'String') {
    return _validateString(against);
  } if (type === 'Boolean') {
    return _validateBoolean(against);
  } if (type === 'Number') {
    return _validateNumber(against);
  } if (type === 'Null') {
    return _validateNull(against);
  } if (type === 'Any') {
    return _validateAny(against);
  } if (type === 'BusinessState') {
    return _validateBusinessState(against);
  } if (!validator[type]) {
    return {
      valid: false,
    };
  } if (!validator[type].isPrimitive) {
    return {
      valid: validateSchema(validator, validator[type].properties, against),
    };
  }
  return {
    valid: Function('val', `return ${validator[type].validation};`)(against), // eslint-disable-line
  };
}
const validationErrorMsgs = {
  string: 'Must be a valid string',
  email: 'Must be a valid email address',
  boolean: 'Must be a valid boolean value',
  password: 'Must have capital and lowercased letters and be at least 8 characters',
  number: 'Must be a valid number',
  phoneNumber: 'Must be a valid phone number, e.g. 1-800-233-1212',
  businessState: 'Must be a valid state abbreviation',
};

const utils_typesvalidator = {
  validateSchema,
  validateType,
  validateMap,
  validationErrorMsgs,
};

export default utils_typesvalidator;

// Internal Helper Functions ... 
function _validateString(value) {
  return {
    valid: (typeof value) === 'string',
  };
}

function _validateBoolean(value) {
  return {
    valid: (typeof value) === 'boolean',
  };
}

function _validateNumber(value) {
  return {
    valid: (typeof value) === 'number',
  };
}

function _validateNull(value) {
  return {
    valid: value === null || value === undefined,
  };
}

function _validateAny() {
  return {
    valid: true,
  };
}

function _validateBusinessState(value) {
  if (typeof value !== 'string') {
    return {
      valid: false,
    };
  }

  const uppercaseValue = value.toUpperCase();
  const stateMap = {
    AL: true, // Alabama
    AK: true, // Alaska
    AZ: true, // Arizona
    AR: true, // Arkansas
    CA: true, // California
    CO: true, // Colorado
    CT: true, // Connecticut
    DE: true, // Delaware
    DC: true, // District of Columbia
    FL: true, // Florida
    GA: true, // Georgia
    HI: true, // Hawaii
    ID: true, // Idaho
    IL: true, // Illinois
    IN: true, // Indiana
    IA: true, // Iowa
    KS: true, // Kansas
    KY: true, // Kentucky
    LA: true, // Louisiana
    ME: true, // Maine
    MD: true, // Maryland
    MA: true, // Massachusetts
    MI: true, // Michigan
    MN: true, // Minnesota
    MS: true, // Mississippi
    MO: true, // Missouri
    MT: true, // Montana
    NE: true, // Nebraska
    NV: true, // Nevada
    NH: true, // New Hampshire
    NJ: true, // New Jersey
    NM: true, // New Mexico
    NY: true, // New York
    NC: true, // North Carolina
    ND: true, // North Dakota
    OH: true, // Ohio
    OK: true, // Oklahoma
    OR: true, // Oregon
    PA: true, // Pennsylvania
    RI: true, // Rhode Island
    SC: true, // South Carolina
    SD: true, // South Dakota
    TN: true, // Tennessee
    TX: true, // Texas
    UT: true, // Utah
    VT: true, // Vermont
    VA: true, // Virginia
    WA: true, // Washington
    WV: true, // West Virginia
    WI: true, // Wisconsin
    WY: true, // Wyoming
    AS: true, // American Samoa
    GU: true, // Guam
    MP: true, // Northern Mariana Islands
    PR: true, // Puerto Rico
    VI: true, // U.S. Virgin Islands
  };
  return {
    valid: stateMap[uppercaseValue] || false,
  };
}

// GENERATOR_TYPE='util';
