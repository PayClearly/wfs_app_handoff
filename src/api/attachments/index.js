/* eslint-disable import/no-import-module-exports */
import { api } from 'api/_util/wfsapi';
import axios from 'axios';
import download from 'downloadjs';
import firebase from 'firebase';

// eslint-disable-next-line default-param-last
function create(files = [], storagePath) {
  // Add code for database or API integrations

  return false;
}

function fetchAttachment(attachmentMetadata) {
  // Add code for database or API integrations

  return false;
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
  // Add code for database or API integrations

  return false;
}

module.exports = {
  create,
  fetchAttachment,
  downloadAttachment,
};
