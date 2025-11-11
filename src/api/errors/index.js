import axios from 'axios';

function logError(error) {
  return axios.post('https://CHANGE_ME.firebaseio.com/oopsErrors.json', error);
}

const scope = {
 logError,
};

export default scope;
