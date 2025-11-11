// Third Party Imports ...

// import Utils from 'utils';

function utils_isSchemaValid(credentials = {}, against = {}) {
  return Object.keys(credentials).every((key) => {
    return (credentials[key].required && against[key]) || !credentials[key].required;
  });
}

export default utils_isSchemaValid;


