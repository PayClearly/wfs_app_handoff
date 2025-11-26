
// Base64 map
const tableStr = '+-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const table = tableStr.split('');

// Status Map
const statusMap = {
  blocked: 'b',
  cancelled: 'x',
  complete: 'c',
  inactive: 'i',
  on_hold: 'h',
  pending: 'p',
  processed: 'px',
  stolen: 's',
  tracking: 't',
};
const compressedStatusMap = Object.keys(statusMap)
.reduce((acc, curr) => {
  acc[statusMap[curr]] = curr;
  return acc;
}, {});

function compress(type, val) {
  const compressor = {
    UUID: (val) => {
      return _binaryToBase64(_hexToBinary(val.replace(/-/g, '')));
    },
    EPOC: (val) => {
      const copy = val * 2;
      return _binaryToBase64(_intToBinary(copy));
    },
    STATUS: (val) => {
      return statusMap[val] || 'xx';
    },
  };
  return compressor[type] && compressor[type](val);
}

function decompress(type, val) {
  const decompressor = {
    UUID: (val) => {
      const copy = _insertAt(_binaryToHex(_base64toBinary(val)), [
        { index: 8, val: '-' },
      ]);
      return copy;
    },
    EPOC: (val) => {
      const copy = val;
      return _binaryToInt(_base64toBinary(copy)) / 2;
    },
    STATUS: (val) => {
      return compressedStatusMap[val] || 'unknown';
    },
  };
  return decompressor[type] && decompressor[type](val);
}

module.exports = {
  compress,
  decompress,

  _binaryToBase64,
  _base64toBinary,

  _hexToBinary,
  _binaryToHex,

  _hexTobase64,
  _base64Tohex,

  _intToBinary,
  _binaryToInt,
};

/*

  . (period) 002e

  $ (dollar sign) 0024

  [ (left square bracket) 005b

  ] (right square bracket) 005d

  # (hash or pound sign) 0023

  / (forward slash) 005c

*/

function _hexTobase64(val) {
  return _binaryToBase64(_hexToBinary(val));
}

function _base64Tohex(val) {
  return _binaryToHex(_base64toBinary(val));
}

function _hexToBinary(str) {
  const copy = str;
  let toReturn = '';
  let index = 0;
  while (index < str.length) {
    toReturn += _parseToLength(copy.substring(index, index + 1), 16, 2, 4);
    index += 1;
  }
  return toReturn;
}

function _binaryToHex(str) {
  const copy = str;
  let toReturn = '';
  let index = 0;
  while (index < str.length) {
    toReturn += parseInt(copy.substring(index, index + 4), 2).toString(16);
    index += 4;
  }
  return toReturn;
}

function _parseToLength(val, base1, base2, length) {
  let toReturn = `${parseInt(val, base1).toString(base2)}`;
  while (toReturn.length < length) {
    toReturn = `0${toReturn}`;
  }
  return toReturn;
}

function _binaryToBase64(val) {
  const copy = val;
  let toConcat = '';
  return copy.match(/.{1,6}/g).map((item) => {
    let toUse = item;
    if (item.length === 2) {
      toUse = `${toUse}0000`;
      toConcat = '==';
    }
    if (item.length === 4) {
      toUse = `${toUse}00`;
      toConcat = '=';
    }
    return table[parseInt(toUse, 2)];
  }).join('').concat(toConcat);
}

function _base64toBinary(val) {
  const copy = val;
  let toTrim = 0;
  const toReturn = copy.split('')
  .filter((item) => { if (item === '=') { toTrim += 2; return ''; } return item; })
  .map((item) => {
    return _parseToLength(table.indexOf(item), 10, 2, 6);
  });

  // modify the last item in the array
  const lastIndex = toReturn.length - 1;
  const last = toReturn[lastIndex].split('');
  while (toTrim > 0) {
    last.pop();
    toTrim -= 1;
  }
  toReturn[lastIndex] = last.join('');
  return toReturn.join('');
}

function _intToBinary(val) {
  const copy = val;
  return copy.toString(2);
}

function _binaryToInt(val) {
  const copy = val;
  return parseInt(copy, 2);
}

function _insertAt(val, points = []) {
  let toReturn = val;
  points.sort((point1, point2) => { return point1.index < point2.index; })
  .forEach((point) => {
    toReturn = toReturn.substr(0, point.index) + point.val + toReturn.substr(point.index);
  });
  return toReturn;
}
