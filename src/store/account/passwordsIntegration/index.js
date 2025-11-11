

//   },
//   },
// };




//         ...state,
//           ...state.resources,
//           ...(action.resource && { [action.resource]: {
//             ...state.resources[action.resource],
//             ...action.items,
//           } } || {}),
//         },
//           ...state._resources,
//           ...(action._resource && { [action._resource]: {
//             ...state._resources[action._resource],
//             ...action.items,
//           } } || {}),
//         },
//         ...(action.name && { [action.name]: {
//             ...state.resources[action.resource],
//             ...action.items,
//           } } || {}),
//       };

//         ...state,
//       };


//   }
// }

// });


// // action creators
//   console.log('sync passwords')
//     console.log('definition', definition);
//     // wait until definition exists
//       .then(() => {
//       });
//     }

//     dispatch({ type: actionTypes.fetchStart });
//           dispatch({ type: actionTypes.updateSuccess, items, paths, name });
//         });
//       }))
//     .then((items) => {
//       dispatch({ type: actionTypes.fetchSuccess });
//     });
//   };
// }

//     dispatch({ type: actionTypes.createStart });
//     .then((res) => {
//       dispatch({ type: actionTypes.createSuccess, data: res });
//     })
//     .catch((error) => {
//       dispatch({ type: actionTypes.createError, error: 'Failed to link, please reach out to your admin' });
//     });
//   };
// }

//     dispatch({ type: actionTypes.updateStart });
//     .then((res) => {
//       dispatch({ type: actionTypes.updateSuccess, data: res });
//     })
//     .catch((error) => {
//       dispatch({ type: actionTypes.updateError, error: error.response.data.error });
//     });
//   };
// }

//     dispatch({ type: actionTypes.clearErrors, data: {} });
//   };
// }

//     dispatch({ type: actionTypes.fetchStart });
    
//         Object.keys(items || {}).forEach((item) => { data[item].itemType = key; });
//       });
//     }))
//     .then(() => {
//       dispatch({ type: actionTypes.fetchSuccess, items: data, name: 'currentIssues' });
//     })
//     .catch((error) => {
//       dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
//     });
//   };
// }

//     dispatch({ type: actionTypes.updateStart });
//     .then((res) => {
//       dispatch({ type: actionTypes.updateSuccess });
//     })
//     .catch((error) => {
//       dispatch({ type: actionTypes.updateError, error: error.response.data.error });
//     });
//   };
// }

//     removeListeners(getState().account.erpIntegration.data.paths);
//     dispatch({ type: actionTypes.clear });
//   };
// }
