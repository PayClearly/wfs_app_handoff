



// };

// };


// describe('forms duck', () => {

//   beforeEach(() => {


//   });

//   afterEach(() => {
//   });

//   describe('action creators', () => {

//     describe('blur', () => {
//       it('should dispatch FORM_BLUR action with proper data', () => {
//         store.dispatch(forms.blur(formName, formKey, fieldName));
//         expect(store.getActions()[0]).to.deep.equal({ type: 'FORM_BLUR', data: { formName, formKey, fieldName } });
//       });
//     });

//     describe('change', () => {
//       it('should dispatch FORM_CHANGE action with proper data', () => {
//         store.dispatch(forms.change(formName, formKey, fieldName, newValue));
//         expect(store.getActions()[0]).to.deep.equal({ type: 'FORM_CHANGE', data: { formName, formKey, fieldName, newValue } });
//       });
//     });

//     describe('focus', () => {
//       it('should dispatch FORM_FOCUS action with proper data', () => {
//         store.dispatch(forms.focus(formName, formKey, fieldName));
//         expect(store.getActions()[0]).to.deep.equal({ type: 'FORM_FOCUS', data: { formName, formKey, fieldName } });
//       });
//     });

//     describe('destroy', () => {
//       it('should dispatch FORM_DESTROY action with proper data', () => {
//         store.dispatch(forms.destroy(formName, formKey));
//         expect(store.getActions()[0]).to.deep.equal({ type: 'FORM_DESTROY', data: { formName, formKey } });
//       });
//     });

//     describe('initialize', () => {
//       it('should dispatch FORM_INITIALIZE action with proper data', () => {
//         store.dispatch(forms.initialize(formName, formKey, fields));
//         expect(store.getActions()[0]).to.deep.equal({ type: 'FORM_INITIALIZE', data: { formName, formKey, fields } });
//       });
//     });

//     describe('setview', () => {
//       it('should dispatch FORM_SETVIEW action with proper data', () => {
//         store.dispatch(forms.setview(formName, formKey, viewData));
//         expect(store.getActions()[0]).to.deep.equal({ type: 'FORM_SETVIEW', data: { formName, formKey, data: viewData } });
//       });
//     });

//     describe('validate', () => {
//       it('should dispatch FORM_VALIDATE action with proper data', () => {
//         store.dispatch(forms.validate(formName, formKey, validate));
//         expect(store.getActions()[0]).to.deep.equal({ type: 'FORM_VALIDATE', data: { formName, formKey, validate } });
//       });
//     });

//     describe('addChild', () => {
//       it('should dispatch FORM_ADD_CHILD action with proper data', () => {
//         store.dispatch(forms.addChild(formName, formKey, childFormName, childFormKey));
//         expect(store.getActions()[0]).to.deep.equal({ type: 'FORM_ADD_CHILD', data: { formName, formKey, childFormName, childFormKey } });
//       });
//     });

//   });

//   describe('reducer', () => {

//     beforeEach(() => {
//         },
//       };
//     });

//     it('should add the form name and key and field name to the state if they dont exist doesn\'t exist', () => {
//             ...initialState.formName.formKey,
//             },
//               ...defaultFieldState,
//             },
//           },
//         },
//       };
//       expect(forms.reducer({}, action)).to.deep.equal(desiredState);
//     });


//     describe('FORM_BLUR', () => {
//       it('should mark the field as touched', () => {
//               ...initialState.formName.formKey,
//               },
//                 ...defaultFieldState,
//               },
//             },
//           },
//         };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });
//     });

//     describe('FORM_CHANGE', () => {
//       it('should set the new value and field Value', () => {
//               ...initialState.formName.formKey,
//               },
//                 ...defaultFieldState,
//               },
//             },
//           },
//         };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });
//     });

//     describe('FORM_FOCUS', () => {
//       it('should mark field as visited', () => {
//               ...initialState.formName.formKey,
//               },
//                 ...defaultFieldState,
//               },
//             },
//           },
//         };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });
//     });

//     describe('FORM_SETVIEW', () => {
//       it('should set the _view property', () => {
//               ...initialState.formName.formKey,
//             },
//           },
//         };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });
//     });

//     describe('FORM_DESTROY', () => {
//       it('should set the form to it\'s default state', () => {
//               ...defaultFormState,
//               },
//             },
//           },
//         };
//           },
//         };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });
//     });

//     describe('FORM_INITIALIZE', () => {
//       it('should initialize the form with the fields provided', () => {
//               ...initialState.formName.formKey,
//                 fieldName,
//                 fieldName2,
//               },
//                 ...defaultFieldState,
//               },
//                 ...defaultFieldState,
//               },
//             },
//           },
//         };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });
//     });

//     describe('FORM_VALIDATE', () => {
//       it('should flag an error if field is not valid', () => {
//               ...defaultFormState,
//                 fieldName,
//               },
//             },
//           },
//         };
//               ...initialState.formName.formKey,
//               },
//                 ...defaultFieldState,
//               },
//             },
//           },
//         };
//         };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });

//       it('should clear errors if one isn\'t returned for a field', () => {
//               ...defaultFormState,
//                 fieldName,
//               },
//             },
//           },
//         };
//               ...initialState.formName.formKey,
//               },
//             },
//           },
//         };
//         };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });

//       it('should mark the parent as _allValid false if the child is all are not valid in the child', () => {
//               ...defaultFormState,
//             },
//           },
//               ...defaultFormState,
//                 fieldName,
//               },
//             },
//           },
//         };
//               ...initialState.formName.formKey,
//             },
//           },
//               ...initialState.childFormName.childFormKey,
//               },
//                 ...defaultFieldState,
//               },
//             },
//           },
//         };
//         };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });

//     });

//     describe('FORM_ADD_CHILD', () => {
//       it('should add a reference to the form and to the parent', () => {
//           },
//           },
//         };
//               ...defaultFormState,
//             },
//           },
//               ...defaultFormState,
//             },
//           },
//         };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });

//       it('should not add childern or parents if they already exists', () => {
//               ...defaultFormState,
//             },
//           },
//               ...defaultFormState,
//             },
//           },
//         };
//         expect(forms.reducer(initialState, action)).to.deep.equal(initialState);
//       });
//     });

//     it('should add a additional parent and child reference to the forms', () => {
//             ...defaultFormState,
//           },
//         },
//             ...defaultFormState,
//           },
//         },
//         },
//       };
//             ...defaultFormState,
//           },
//         },
//             ...defaultFormState,
//           },
//         },
//         },
//       };
//       expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//     });

//     describe('Other action types', () => {
//       it('should return default state if the there is not input and the action isn\'t defined', () => {
//         expect(forms.reducer(undefined, action)).to.deep.equal(desiredState);
//       });

//       it('_formKeyReducer shoud return default state if', () => {
//         expect(forms._formKeyReducer(undefined, action)).to.deep.equal(desiredState);
//       });

//       it('_formReducer shoud return default state if', () => {
//         expect(forms._formReducer(undefined, action)).to.deep.equal(desiredState);
//       });

//       it('_fieldReducer shoud return default state if', () => {
//         expect(forms._fieldReducer(undefined, action)).to.deep.equal(desiredState);
//       });

//     });


//   });
// });
