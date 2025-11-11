import axios from 'axios';
import firebase from 'firebase';

async function fetchKeys(path, callback) {
  const token = await firebase.auth().currentUser.getIdToken(true);
  let uriParams;
  let databaseUrl;

  if (window.GLOBALCERT.databaseURL.includes('?ns=')) {
    databaseUrl = window.GLOBALCERT.databaseURL.split('?ns=')[0]; //eslint-disable-line
    const namespace = window.GLOBALCERT.databaseURL.split('?ns=')[1];
    uriParams = `auth=${token}&shallow=true&ns=${namespace}`;
  } else {
    uriParams = `auth=${token}&shallow=true`;
    databaseUrl = window.GLOBALCERT.databaseURL;
  }

  const res = await axios.get(`${databaseUrl}/${path}.json?${uriParams}`);

  return callback(res.data);
}

const scope = {
  fetchKeys,
};

export default scope;
