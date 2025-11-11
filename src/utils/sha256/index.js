import crypto from 'crypto';

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest();
}

export default sha256;
