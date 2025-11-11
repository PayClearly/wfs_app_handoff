import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import base64FromPath from '../base64FromPath';
import { isPlatform } from '@ionic/react';
import { Capacitor } from '@capacitor/core';

const _set = (key, value) => {
  if (!value || typeof value === 'undefined') {
    throw new Error(`cannot set value '${value}'`);
  }

  return SecureStoragePlugin.set({ key: `payclearlyPHOTOS.${key}`, value });
};

const _get = async (key) => {
  try {
    const storage = SecureStoragePlugin;

    const keys = await storage.keys().then((res) => res.value.filter((_key) => _key && _key.includes(key)));
    const items = await Promise.all(keys.filter((_key) => _key.includes(key)).map((item) => storage.get({ key: item }))).then((res) => res || '{}');
    return items.reduce((acc, curr, index) => {
      acc[`${keys[index].split('payclearlyPHOTOS.')[1]}`] = curr.value;
      return acc;
    }, {});
  } catch (err) {
    return null;
  }
};

const _getItem = async (key) => {
  try {
    const storage = SecureStoragePlugin;

    const item = await storage.get({ key }).then((res) => res && res.value || '{}');
    return { [key]: item };
  } catch (err) {
    return null;
  }
};

const _keys = async (extraFilter) => {
  try {
    const keys = await SecureStoragePlugin.keys();
    return keys.value.filter((key) => {
      let filterValue;
      if (extraFilter) {
        filterValue = key && key.includes('payclearlyPHOTOS') && key.includes(extraFilter);
      } else {
        filterValue = key && key.includes('payclearlyPHOTOS');
      }
      return filterValue;
    });
  } catch (err) {
    return null;
  }
};

const _remove = (key) => SecureStoragePlugin.remove({ key: key.includes('payclearlyPHOTOS.') ? `${key}` : `payclearlyPHOTOS.${key}` });


const savePicture = async (photo, fileName) => {
  let base64Data;
  // "hybrid" will detect Cordova or Capacitor;
  if (isPlatform('hybrid')) {
    const file = await Filesystem.readFile({
      path: photo.path,
    });
    base64Data = file.data;
  } else {
    base64Data = await base64FromPath(photo.webPath);
  }
  const savedFile = await Filesystem.writeFile({
    path: fileName,
    data: base64Data,
    directory: Directory.Data,
  });

  if (isPlatform('hybrid')) {
    // Display the new image by rewriting the 'file://' path to HTTP
    // Details: https://ionicframework.com/docs/building/webview#file-protocol
    return {
      filepath: savedFile.uri,
      webviewPath: Capacitor.convertFileSrc(savedFile.uri),
    };
  }
  return {
    filepath: fileName,
    webviewPath: base64Data,
  };
};

const takePhoto = async (fileName, setPhotoCallback, cancelCallback) => {
  let photo;
  try {
    photo = await Camera.getPhoto({
      quality: 100,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      correctOrientation: true,
    });
  } catch (e) {
    cancelCallback();
    return;
  }
  await removePhotosFuzzySearch(fileName.split('-')[0]);
  const savedPhoto = await savePicture(photo, `${fileName}.jpeg`);
  const setData = setPhotoCallback(savedPhoto);
  await _set(fileName, JSON.stringify(setData));
};

const choosePhoto = async (fileName, setPhotoCallback, cancelCallback) => {
  let photo;
  try {
    photo = await Camera.getPhoto({
      quality: 100,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      correctOrientation: true,
    });
  } catch (e) {
    cancelCallback();
    return;
  }

  await removePhotosFuzzySearch(fileName.split('-')[0]);
  const savedPhoto = await savePicture(photo, `${fileName}.jpeg`);
  const setData = setPhotoCallback(savedPhoto);
  await _set(fileName, JSON.stringify(setData));
};

const retrievePhotos = async (key, setPhotoCallback, mostRecentReturn) => {
  const retrievedData = await _get(key);
  let photosInStorage = retrievedData[key] ? JSON.parse(retrievedData[key]) : [];
  if (mostRecentReturn) {
    const retrievedKeys = Object.keys(retrievedData);
    if (Object.keys(retrievedKeys).length) {
      const mostRecent = retrievedKeys.sort((a, b) => Number(a.split('-')[1]) - (b.split('-')[1]))[0];
      photosInStorage = retrievedData[mostRecent] ? JSON.parse(retrievedData[mostRecent]) : [];
      await Filesystem.stat({
        path: `${mostRecent}.jpeg`,
        directory: Directory.Data,
      }).then((result) => {
        photosInStorage[0].filepath = result.uri;
        photosInStorage[0].webviewPath = Capacitor.convertFileSrc(result.uri);
      }).catch((e) => {
        photosInStorage = [];
      });
    }
  }
  if (photosInStorage.length === 0) {
    // Make sure no file is in device data and not in the storage
    removePhotos(await _keys(key.split('-')[0]), () => {}, true);
    return;
  }
  let returnPhotos;
  let returnValue;
  // aka if running on web
  if (!isPlatform('hybrid')) {
    returnPhotos = await Promise.all(photosInStorage.map(async (photo) => {
      const returnPhoto = { ...photo };
      let file;
      try {
        file = await Filesystem.readFile({
          path: photo.filepath,
          directory: Directory.Data,
        });
      } catch (e) {
        // Photo is in storage, but not in file system. Delete photo from storage
        await _remove(key);
        return null;
      }
      // Web platform only: Load the photo as base64 data
      returnPhoto.webviewPath = `data:image/jpeg;base64,${file.data}`;
      return returnPhoto;
    }));
    if (!returnPhotos) {
      return;
    }
    returnValue = setPhotoCallback(returnPhotos);
  } else {
    returnPhotos = photosInStorage;
    returnValue = setPhotoCallback(returnPhotos);
  }
  return returnValue;
};

const removePhoto = async (key, setPhotoCallback, bypass = false) => {
  const retrievedData = await _get(key);
  const photosInStorage = retrievedData[key] ? JSON.parse(retrievedData[key]) : [];
  if (bypass) {
    try {
      await Filesystem.deleteFile({
        path: `${key}.jpeg`,
        directory: Directory.Data,
      });
    } catch (e) {
      // Indicates there was no file
    }
    return;
  }
  if (photosInStorage.length === 0) {
    return;
  }

  let returnPhotos;

  // aka if running on web
  if (!isPlatform('hybrid')) {
    returnPhotos = await Promise.all(photosInStorage.map(async (photo) => Filesystem.deleteFile({
        path: photo.filepath,
        directory: Directory.Data,
      })));
  } else {
    returnPhotos = await Promise.all(photosInStorage.map(async (photo) => {
      let filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
      if (!filename.includes('.jpeg')) {
        filename += '.jpeg';
      }
      await Filesystem.deleteFile({
        path: filename,
        directory: Directory.Data,
      });
      return Promise.resolve();
    }));
  }
  await _remove(key);
  setPhotoCallback(returnPhotos);
};

const removePhotosFuzzySearch = async (keyPrefix) => {
  const photosInSystem = await Filesystem.readdir({ path: '/', directory: Directory.Data });
  const photosToRemoveStorage = await _get(keyPrefix);
  const photosToRemoveSystem = await photosInSystem.files.filter((photo) => photo.name.includes(keyPrefix));

  return Promise.all([...photosToRemoveSystem.map(async (systemPhoto) => {
    try {
      await Filesystem.deleteFile({
        path: systemPhoto.name,
        directory: Directory.Data,
      });
    } catch (e) {
      // Indicates there was no file
    }
    return Promise.resolve();
  }), ...Object.keys(photosToRemoveStorage).map(async (storagePhoto) => _remove(storagePhoto))]);
};

const removePhotos = async (keys, setPhotoCallback, bypass = false, fuzzy) => {
  let returnPhotos = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const retrievedData = await _getItem(key);
    const photosInStorage = retrievedData[key] ? JSON.parse(retrievedData[key]) : [];
    if (bypass) {
      try {
        await Filesystem.deleteFile({
          path: `${key}`,
          directory: Directory.Data,
        });
      } catch (e) {
        // Indicates there was no file
      }
      continue;
    }
    if (photosInStorage.length === 0) {
      continue;
    }

    // aka if running on web
    if (!isPlatform('hybrid')) {
      returnPhotos = [...returnPhotos, ...(await Promise.all(photosInStorage.map(async (photo) => {
        try {
          Filesystem.deleteFile({
          path: photo.filepath,
          directory: Directory.Data,
          });
        } catch (e) {
          // Indicates there was no file
        }
        return Promise.resolve();
      })))];
    } else {
      returnPhotos = [...returnPhotos, ...(await Promise.all(photosInStorage.map(async (photo) => {
        try {
          const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
          const files = await Filesystem.readdir({ path: '', directory: Directory.Data });
          if (files.length) {
            await Filesystem.deleteFile({
              path: filename,
              directory: Directory.Data,
            });
          }
        } catch (e) {
          // No file to delete or no dir
        }
        return Promise.resolve();
      })))];
    }
    await _remove(key);
  }

  setPhotoCallback(returnPhotos);
};


export default {
  takePhoto,
  choosePhoto,
  retrievePhotos,
  removePhoto,
  removePhotos,
};
