import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import AttachmentsAPI from 'api/attachments';
// import { Parser } from 'json2csv';
// import download from 'downloadjs';
// import CardsIntegrationAPI from 'api/cardsIntegration';

const namespace = 'ATTACHMENTS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  paths: {},
  items: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      return {
        ...state,
        items: { ...state.items, ...action.data },
        paths: { ...state.paths, ...action.paths },
      };

    default:
      return state;
  }
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});

export default reducer;

// action creators
export function fetch(attachmentMetadata) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return AttachmentsAPI.fetchAttachment(attachmentMetadata)
      .then((file) => {
        const data = { [attachmentMetadata.md5Hash]: file.preview };
        dispatch({ type: actionTypes.fetchSuccess, data });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
      });
  };
}

// export function downloadAPRETURN(batchId) {
//   return (dispatch, getState) => {
//     const state = getState();

//     dispatch({ type: actionTypes.fetchStart });

//     // get all the necesary vCardids
//     const paymentIds = state.account.paymentStatuses.data.paymentsByBatch[batchId];
//     const paymentStatuses = paymentIds.map(id => state.account.paymentStatuses.data.items[id]);
//     const vCardData = Object.keys(paymentStatuses).map((statusId) => {
//       const paymentStatus = paymentStatuses[statusId];
//       const card = paymentStatus.funded.vCards[0];
//       return state.account.cardsIntegration.data.resources.vCards[card.id];
//     });
//     const accountVendors = state.account.accountVendors.data.items;

//     const fields = ['Customer Payment ID', 'EFS Payment ID', 'File Number', 'Outsource ID', 'Company Number', 'Account Number', 'Vendor Code', 'Vendor Sub Code', 'File Date', 'Total Net Payment Amount', 'Check Number', 'Payment Date', 'Payment Type', 'Card CTS', 'Card Last 4', 'Import Status', 'Error Message', 'Batch ID', 'Payment Due Date '];

//     const data = paymentStatuses.map((paymentStatus, i) => {
//       return {
//         'Customer Payment ID': paymentStatus.created.customFields['Customer Payment ID'],
//         'EFS Payment ID': '',
//         'File Number': paymentStatus.created.customFields['File Number'],
//         'Outsource ID': paymentStatus.created.customFields['Outsource ID'],
//         'Company Number': '',
//         'Account Number': '',
//         'Vendor Code': accountVendors[paymentStatus.created.vendorId].name,
//         'Vendor Sub Code': '',
//         'File Date': paymentStatus.created.customFields['File Date'], // could be pulled off the upload
//         'Total Net Payment Amount': Number(paymentStatus.created.amount).toFixed(2),
//         'Check Number': paymentStatus.created.customFields['Check Number'],
//         'Payment Date': (new Date(paymentStatus.created._createdAt)).toISOString().split('T')[0].split('-').join(''),
//         'Payment Type': 'V',
//         'Card CTS': vCardData[i]._id, // _id is where to CTS is stored in prod but its not the same in development
//         'Card Last 4': vCardData[i].cardNumberLastFour,
//         'Import Status': 'SUCCESS',
//         'Error Message': '',
//         'Batch ID': paymentStatus.created.customFields['Batch ID'], // comes off the upload
//         'Payment Due Date ': '',
//       };
//     });

//     const parser = new Parser({ fields, delimiter: '|', quote: '' });
//     const csv = parser.parse(data);
//     dispatch({ type: actionTypes.fetchSuccess, data });
//     return download(csv, `PC_${batchId}.dat`);
//   };
// }


// export function downloadPS21(batchId) {
//   return (dispatch, getState) => {
//     const state = getState();
//     const uploadTemplate = state.account.paymentPipelinePreferences.data.item.uploadTemplate || [];
//     const lineItemFieldName = (uploadTemplate.find(item => item.lineItemField === 'key') || {}).pcField || 'Check Number';
  
//     dispatch({ type: actionTypes.fetchStart });
//     return AttachmentsAPI.fetchAttachment({
//       storagePath: `/batchAttachments/${state.organization.data.id}/${state.account.data.id}/${batchId}/${batchId}_upload_file.txt`,
//       originalname: `${batchId}_upload_file.txt`,
//       contentType: 'text/plain',
//       resourcePath: `/state/paymentStatuses/${state.organization.data.id}/${state.account.data.id}`,
//     }).then((res) => {
//       const reader = new FileReader();
//       reader.readAsBinaryString(res);
//       reader.onloadend = () => {
//         const data = reader.result.split('\n').filter(line => line !== '');
//         const [header, footer] = [data[0], data[data.length - 1]];

//         // get all the necesary vCardids
//         const paymentIds = state.account.paymentStatuses.data.paymentsByBatch[batchId];
//         const paymentStatuses = paymentIds.map(id => state.account.paymentStatuses.data.items[id]);
//         const vCardIds = Object.keys(paymentStatuses).map((statusId) => {
//           const paymentStatus = paymentStatuses[statusId];
//           const card = paymentStatus.funded.vCards[0];
//           return card.id;
//         });

//         // get all the associated private v card info
//         return CardsIntegrationAPI.getVCards(state.organization.data.id, state.account.data.id, vCardIds)
//           .then((response) => {
//             let appendedLines = [];

//             // write and download
//             Object.keys(paymentStatuses).forEach((statusId) => {
//               const paymentStatus = paymentStatuses[statusId];
//               // private card data
//               const vCard = response[paymentStatus.funded.vCards[0].id];
//               // card data we save
//               const { createdAt } = state.account.cardsIntegration.data.resources.vCards[paymentStatus.funded.vCards[0].id];
//               const dateFormatOfCreatedAt = new Date(createdAt);

//               const lineItemKey = paymentStatus.created.customFields[lineItemFieldName];

//               const relevantLineItems = data.filter(line => line.includes(lineItemKey));

//               const appendedLineItems = relevantLineItems.map((line) => {
//                 const split = line.replace('\r', '').split('\t');
//                 const [before, after] = [split.slice(0, 45), split.slice(45)];
//                 const insertableLineItems = [
//                   '', // card number hash
//                   '', // card number token
//                   `xxxxxxxxxxxx${vCard.cardNumber.slice(12)}`, // card number masked last 4
//                   `${vCard.cardExpirationMonth}${vCard.cardExpirationYear.slice(2)}`, // expiration MMYY format
//                   vCard.cardcvv, // cvv
//                   `${String(dateFormatOfCreatedAt.getMonth() + 1).padStart(2, '0')}${String(dateFormatOfCreatedAt.getDate()).padStart(2, '0')}${dateFormatOfCreatedAt.getFullYear()}`, // card issue date MMDDYYYY
//                   '', // response file batch number
//                   '', // response file batch date
//                   '00000', // error code
//                   'SUCCESSFUL Transaction', // error description
//                 ];
//                 const newLine = [...before, ...insertableLineItems, ...after];
//                 return newLine.join('\t');
//               });
//               appendedLines = [...appendedLines, ...appendedLineItems];
//             });

//             const finalLines = [header, ...appendedLines, footer];
//             const final = finalLines.join('\n');
//             const file = new File([final], `PS21_${batchId}`, { type: 'text/plain' });
//             dispatch({ type: actionTypes.fetchSuccess, data });
//             return download(file, `PS21_${batchId}.txt`, 'text/plain');
//           });
//       };
//     });
//   };
// }
