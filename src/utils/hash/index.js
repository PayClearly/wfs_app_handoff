// Third Party Imports ...
import md5 from 'md5';

function utils_hash(data) {
  return md5(data || '');
}

export default utils_hash;

