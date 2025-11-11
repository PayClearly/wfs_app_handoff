// Third Party Imports ...
import md5 from 'md5';

// import Utils from 'utils';

function utils_hash(data) {
  return md5(data || '');
}

export default utils_hash;


