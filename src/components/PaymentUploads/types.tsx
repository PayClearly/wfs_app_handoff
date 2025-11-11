

export type FTPFile = {
  _batchId: string | null;
  _id: string;
  attachment: Attachment;
  status: 'pending' | 'processed' | 'archived' | 'held';
  uploadedAt: string;
}
export type FlattenedFTPFile = FTPFile & {
  fileName: string;
}

export type FTPFiles = Record<FTPFile['_id'], FTPFile>
export type FlattenedFTPFiles = Record<FlattenedFTPFile['_id'], FlattenedFTPFile>

export type NavigateData = {
  _id: string;
  forSFTP: boolean;
}

export type AttachmentMetadata = {
  directory: string;
  resourcePath: string;
  storagePath: string;
}
type Attachment = {
  contentType: string;
  directory: string;
  md5Hash: string;
  originalname: string;
  resourcePath: string;
  size: string;
  storagePath: string;
}
