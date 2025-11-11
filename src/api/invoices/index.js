import { api } from 'api/_util/payclearlyapi';
import numeral from 'numeral';

function upload(organizationId, accountId, files = []) {
   // filter out non files
   if (!files.length) return Promise.resolve({ data: { invoices: [] } });
   if (files[0] && files[0]._createdBy) return Promise.resolve({ data: { invoices: files } });
 
   const formData = new FormData();
   formData.append('storageBasePath', `invoices/originals/${organizationId}/${accountId}`);
   files.forEach(file => formData.append('files', file));
   formData.append('source', 'uploaded');
   formData.append('options', JSON.stringify({ dataExtraction: true }));

  return api().post(`/invoices/${organizationId}/${accountId}`, formData)
  .then(({ data }) => {
    return data;
  });
}

function update(organizationId, accountId, data) {
  const adapted = {
    ...data,
  };
  delete adapted.approvers;
  if (data.amount) adapted.amount = numeral(data.amount).value();
  return api().patch(`/invoices/${organizationId}/${accountId}/${data.id}`, adapted);
}

function updateAnnotation(organizationId, accountId, data) {
  return api().patch(`/annotations/${organizationId}/${accountId}/${data.id}`, data);
}

const scope = {
  upload,
  update,
  updateAnnotation,
};

export default scope;
