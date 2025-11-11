import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const DEFAULT_OPTIONS = {
  keyPrefix: 'payclearly',
};

const SecureStorageAPI = (options = DEFAULT_OPTIONS) => {
  return {
    set: _set(options),
    get: _get(options),
    keys: _keys(options),
    remove: _remove(options),
    clear: _clear(options),
  };
};

const _set = (options = DEFAULT_OPTIONS) => {
  const { keyPrefix } = options;
  return (key, value) => {
    const storage = SecureStoragePlugin;
    if (!value || typeof value === 'undefined') throw new Error(`cannot set value '${value}'`);

    return storage.set({ key: `${keyPrefix}.${key}`, value });
  };
};

const _get = (options = DEFAULT_OPTIONS) => {
  const { keyPrefix } = options;
  return async(key) => {
    try {
      const storage = SecureStoragePlugin;

      const keys = await storage.keys().then(res => res.value.filter(_key => _key && _key.includes(key)));
      const items = await Promise.all(keys.filter(_key => _key.includes(key)).map(item => storage.get({ key: item }))).then(res => res || '{}');
      return items.reduce((acc, curr, index) => {
        acc[`${keys[index].split(`${keyPrefix}.`)[1]}`] = curr.value;
        return acc;
      }, {});
    } catch (err) {
      return null;
    }
  };
};

const _keys = (options = DEFAULT_OPTIONS) => {
  const { keyPrefix } = options;
  return async() => {
    try {
      const keys = await SecureStoragePlugin.keys();
      return keys.value.filter(key => key && key.includes(keyPrefix));
    } catch (err) {
      return null;
    }
  };
};

const _remove = (options = DEFAULT_OPTIONS) => {
  const { keyPrefix } = options;
  return (key) => {
    return SecureStoragePlugin.remove({ key: `${keyPrefix}.${key}` });
  };
};

const _clear = (options = DEFAULT_OPTIONS) => {
  return () => {
    return SecureStoragePlugin.clear();
  };
};

export default SecureStorageAPI;
