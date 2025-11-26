import firebase from 'firebase';

function _ref(path) {
  // add db prefix
  const _path = `default/${path}`.replace('//', '/');
  return firebase.database().ref(_path);
}

function _hasChildren(path) {
  return new Promise((resolve) => {
    _ref(path).limitToFirst(1).once('value', (snap) => {
      if (snap.val() !== null) {
        resolve(true);
      } else {
        resolve(false);
      }
    })
    .catch(() => {
      resolve(false);
    });
  });
}
function _hasChildrenAtContext(path, context) {
  return new Promise((resolve) => {
    _ref(path).orderByChild('context')
    .startAt(context)
    .endAt(`${context}\uf8ff`)
    .limitToFirst(1)
    .once('value', (snap) => {
      if (snap.val() !== null) {
        resolve(true);
      } else {
        resolve(false);
      }
    })
    .catch(() => {
      resolve(false);
    });
  });
}

function _hasValue(path, getValue) {
  return new Promise((resolve) => {
    _ref(path).once('value', (snap) => {
      if (snap.val() !== null) {
        resolve(getValue ? snap.val() : true);
      } else {
        resolve(false);
      }
    })
    .catch(() => {
      resolve(false);
    });
  });
}

function _burstThrottler(path, onBurst) {

  let bursttrottler;
  let burstItems = {};

  function _burst(key, val) {
    if (key) { burstItems[key] = val; }
    if (bursttrottler) { clearTimeout(bursttrottler); }
    bursttrottler = setTimeout(() => {
      onBurst(burstItems);
      burstItems = {};
    }, 50);
  }

  _ref(path).on('child_added', (snap) => {
    _burst(snap.key, snap.val());
  });
  _ref(path).on('child_changed', (snap) => {
    _burst(snap.key, snap.val());
  });
  _ref(path).on('child_removed', (snap) => {
    _burst(snap.key, { ...snap.val(), _deleted: true });
  });

}

function _keysToPaths(item = {}, depth) {
  if (depth <= 1) {
    return Object.keys(item);
  }
  const paths = [];
  Object.keys(item)
  .forEach((key) => {
    _keysToPaths(item[key], depth - 1)
    .forEach((subpath) => {
      paths.push(`${key}/${subpath}`);
    });
  });
  return paths;
}

export function watchValue(path, callback, callbackInitial) {
  let getValue = false;
  if (callbackInitial) { getValue = true; }

  return _hasValue(path, getValue)
  .then((hasValue) => new Promise((resolve) => {
      if (!hasValue) {
        const paths = {};
        paths[path] = true;
        callback(null, paths);
        resolve();
      }
      if (callbackInitial) {
        const paths = {};
        paths[path] = true;
        callbackInitial(hasValue, paths);
      }
      _ref(path).on(
        'value',
        (snap) => {
          const paths = {};
          paths[path] = true;
          return resolve(callback(snap.val(), paths));
        }
      );
    }));
}

export function watchValues(path, children, callback) {
  return Promise.all(
    children
    .map((child) => watchValue(
        `${path}/${child}`,
        (value, paths) => {
          const items = {};
          items[child] = value;
          callback(items, paths);
        }
      ))
  );
}

export function watchValuesWithFinalCallback(path, children, callback, finalCallback) {
  return watchValues(path, children, callback).then(() => finalCallback());
}

//     children.map((child) => {

export function getContext(path, callback, options = {}) {
  const { context } = options;
  return Promise.all([
    _hasChildrenAtContext(path, context),
  ])
  .then((data) => {
    const hasChild = data[0];
    return new Promise((resolve) => {
      if (!hasChild) {
        callback(null);
        resolve();
      }
      _ref(path).orderByChild('context')
      .startAt(context)
      .endAt(`${context}\uf8ff`)
      .once('value', (snap) => {
        callback(snap.val());
        resolve();
      });
    });
  });
}

export function watchCollection(path, callback, options = {}) {

  return Promise.all([
    _hasChildren(path),
  ])
  .then((data) => {
    const hasChild = data[0];

    return new Promise((resolve) => {
      if (!hasChild) {
        callback({}, { [path]: true });
        resolve();
      }
      resolve();
      setTimeout(() => {
        _burstThrottler(path, (items) => {
          callback(items, { [path]: true });
        });
      }, 0);
    });
  });
}

export function watchNestedValues(path, depth = 2, callback) {
  return _ref(path).once('value')
  .then((snap) => {
    if (!snap.val()) { return Promise.resolve({}); }
    return watchValues(path, _keysToPaths(snap.val(), depth), callback);
  });
}

export function retreiveValue(path, callback) {
  return _ref(path).once('value')
  .then((snap) => {
    if (!snap.val()) { return Promise.resolve({}); }
    callback(snap.val(), path);
  });
}

export function removeListeners(paths) {
  Object.keys(paths)
  .forEach((path) => {
    _ref(path).off();
  });
}

export function watchSlice(path, options = {}, callback) {
  return new Promise((resolve) => {
    let ref = options.parameter ? _ref(path).orderByChild(options.parameter) : _ref(path).orderByKey();
    if (options.parameterValue) { ref = ref.equalTo(options.parameterValue); }
    if (options.start) { ref = ref.startAt(options.start); }
    if (options.end) { ref = ref.endAt(options.end); }
    if (options.limitToFirst) { ref = ref.limitToFirst(options.limitToFirst); }
    if (options.limitToLast) { ref = ref.limitToLast(options.limitToLast); }
    ref.on(
      'value',
      (snap) => {
        const paths = {};
        paths[path] = true;
        callback(snap.val(), paths);
        resolve();
      }
    );
  });
}

export function watchForNewItem(path, params, callback) {
  let ref = _ref(path);
  if (params.order) { ref = ref.orderByChild(params.order); }
  if (params.start) { ref = ref.startAt(params.start); }
  ref = params.last ? ref.limitToLast(1) : ref.limitToFirst(1);
  return ref.on(
    'child_added',
    (snap) => {
      const paths = {};
      paths[path] = true;
      callback(snap.val(), paths);
    }
  );
}

export function watchKeyRange(path, params, callbackInitial, callbackUpdate) {
  const ref = _ref(path).orderByKey().startAt(params.start).endAt(params.end);

  ref.once('value')
  .then((snap) => {
    callbackInitial(snap.val(), { [path]: true });
    return ref.on('child_changed', (snap2) => {
      callbackUpdate({ [snap2.key]: snap2.val() });
    });
  });
}
