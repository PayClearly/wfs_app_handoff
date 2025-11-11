// Third Party Imports ...

// import Utils from 'utils';

function utils_getglobalcertinfo() {
  return {
    dbContext: window.GLOBALCERT.projectId.includes('test') ? 'payclearly-test' : window.GLOBALCERT.projectId,
    projectId: window.GLOBALCERT.projectId,
  };
}

export default utils_getglobalcertinfo;


