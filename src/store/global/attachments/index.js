import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import AttachmentsAPI from 'api/attachments';

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


//     dispatch({ type: actionTypes.fetchStart });

//     // get all the necesary vCardids
//     });


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

//     dispatch({ type: actionTypes.fetchSuccess, data });
//   };
// }


  
//     dispatch({ type: actionTypes.fetchStart });
//     }).then((res) => {
//       reader.readAsBinaryString(res);
//       reader.onloadend = () => {

//         // get all the necesary vCardids
//         });

//         // get all the associated private v card info
//           .then((response) => {

//             // write and download
//             Object.keys(paymentStatuses).forEach((statusId) => {
//               // private card data
//               // card data we save



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
//               });
//             });

//             dispatch({ type: actionTypes.fetchSuccess, data });
//           });
//       };
//     });
//   };
// }
