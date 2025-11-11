import crypto from 'crypto';

function base64URLEncode(str = crypto.randomBytes(32)) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export default base64URLEncode;
