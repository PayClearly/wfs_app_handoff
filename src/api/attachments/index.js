/* eslint-disable import/no-import-module-exports */
import { api } from 'api/_util/payclearlyapi';
import axios from 'axios';
import download from 'downloadjs';
import firebase from 'firebase';

// eslint-disable-next-line default-param-last
function create(files = [], storagePath) {
  // filter out non files
  if (!files.length) {
    return Promise.resolve({ data: { attachments: [] } });
  }

  if (files[0] && files[0]._createdBy) {
    return Promise.resolve({ data: { attachments: files } });
  }

  const formData = new FormData();
  formData.append('storageBasePath', storagePath);
  files.forEach((file) => formData.append('attachments', file));
  return firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
    .then((idToken) => api(idToken).post('/attachments/', formData));
}

function fetchAttachment(attachmentMetadata) {
  const cloudFunctionsEndpoint = window.GLOBALCERT.cloudFunctions;
  return firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
    .then((idToken) => {
      let attachmentSrc = `${cloudFunctionsEndpoint}/attachments/`
        + `?token=${idToken}&path=${attachmentMetadata.storagePath}`;

      if (attachmentMetadata.directory) {
        attachmentSrc += `&directory=${attachmentMetadata.directory}`;
      }

      if (attachmentMetadata.resourcePath) {
        attachmentSrc += `&resourcePath=${attachmentMetadata.resourcePath}`;
      }

      if (attachmentMetadata.forFTP) {
        attachmentSrc += '&forFTP=true';
      }

      if (attachmentMetadata.forSFTP) {
        attachmentSrc += '&forSFTP=true';
      }

      return axios.get(attachmentSrc, { responseType: 'arraybuffer' });
    })
    .then(({ data }) => {
      const file = new File([data], attachmentMetadata.originalname, { type: attachmentMetadata.contentType });
      file.preview = URL.createObjectURL(file);
      return file;
    });
}

/**
 * @param {object} attachmentMetadata
 * @param {string} attachmentMetadata.storagePath
 * @param {string} attachmentMetadata.originalname
 * @param {string} [attachmentMetadata.contentType]
 * @param {string} [attachmentMetadata.directory]
 * @param {string} [attachmentMetadata.resourcePath]
 * @param {string} [attachmentMetadata.forFTP]
 * @param {string} [attachmentMetadata.forSFTP]
 */
function downloadAttachment(attachmentMetadata) {
  const cloudFunctionsEndpoint = window.GLOBALCERT.cloudFunctions;
  return firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
    .then((idToken) => {
      let attachmentSrc = `${cloudFunctionsEndpoint}/attachments/`
        + `?token=${idToken}&path=${encodeURIComponent(attachmentMetadata.storagePath)}`;

      if (attachmentMetadata.directory) {
        attachmentSrc += `&directory=${encodeURIComponent(attachmentMetadata.directory)}`;
      }

      if (attachmentMetadata.resourcePath) {
        attachmentSrc += `&resourcePath=${encodeURIComponent(attachmentMetadata.resourcePath)}`;
      }

      if (attachmentMetadata.forFTP) {
        attachmentSrc += '&forFTP=true';
      }

      if (attachmentMetadata.forSFTP) {
        attachmentSrc += '&forSFTP=true';
      }


      return axios.get(attachmentSrc, { responseType: 'arraybuffer' });
    })
    .then(({ data }) => {
      const file = new File([data], attachmentMetadata.originalname, { type: attachmentMetadata.contentType });
      file.preview = URL.createObjectURL(file);
      return download(file, attachmentMetadata.originalname, attachmentMetadata.contentType);
    });
}

module.exports = {
  create,
  fetchAttachment,
  downloadAttachment,
};
