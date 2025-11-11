// import configureMockStore from 'redux-mock-store';
// import thunk from 'redux-thunk';
// import * as forms from './';


// const mockStore = configureMockStore([thunk]);
// let store = {};

// let initialState = {};
// let action = {};
// let desiredState = {};

// const defaultFormState = {
//   _allValid: true,
//   _allInitial: true,
//   _children: [],
//   _parents: [],
//   _values: {},
//   _view: {},
// };

// const defaultFieldState = {
//   error: null,
//   initial: null,
//   touched: false,
//   valid: true,
//   validating: false,
//   value: null,
//   visited: false,
// };

// const formName = 'formName';
// const formKey = 'formKey';
// const childFormName = 'childFormName';
// const childFormKey = 'childFormKey';
// const fieldName = 'fieldName';
// const fieldName2 = 'fieldName2';
// const newValue = 'newValue';
// const fields = { fieldName, fieldName2 };
// const viewData = {};
// const validate = () => {};
// const setViewData = { test: 'test' };

// describe('forms duck', () => {

//   beforeEach(() => {
//     store = mockStore();

//     initialState = {};
//     action = {};
//     desiredState = {};

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
//       initialState = {
//         formName: {
//           formKey: { ...defaultFormState },
//         },
//       };
//       desiredState = {};
//     });

//     it('should add the form name and key and field name to the state if they dont exist doesn\'t exist', () => {
//       desiredState = {
//         formName: {
//           formKey: {
//             ...initialState.formName.formKey,
//             _values: {
//               fieldName: null,
//             },
//             fieldName: {
//               ...defaultFieldState,
//               visited: true,
//               touched: true,
//             },
//           },
//         },
//       };
//       action = { type: 'FORM_BLUR', data: { formName, formKey, fieldName } };
//       expect(forms.reducer({}, action)).to.deep.equal(desiredState);
//     });


//     describe('FORM_BLUR', () => {
//       it('should mark the field as touched', () => {
//         desiredState = {
//           formName: {
//             formKey: {
//               ...initialState.formName.formKey,
//               _values: {
//                 fieldName: null,
//               },
//               fieldName: {
//                 ...defaultFieldState,
//                 visited: true,
//                 touched: true,
//               },
//             },
//           },
//         };
//         action = { type: 'FORM_BLUR', data: { formName, formKey, fieldName } };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });
//     });

//     describe('FORM_CHANGE', () => {
//       it('should set the new value and field Value', () => {
//         desiredState = {
//           formName: {
//             formKey: {
//               ...initialState.formName.formKey,
//               _values: {
//                 fieldName: newValue,
//               },
//               _allInitial: false,
//               fieldName: {
//                 ...defaultFieldState,
//                 visited: true,
//                 value: newValue,
//               },
//             },
//           },
//         };
//         action = { type: 'FORM_CHANGE', data: { formName, formKey, fieldName, newValue } };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });
//     });

//     describe('FORM_FOCUS', () => {
//       it('should mark field as visited', () => {
//         desiredState = {
//           formName: {
//             formKey: {
//               ...initialState.formName.formKey,
//               _values: {
//                 fieldName: null,
//               },
//               fieldName: {
//                 ...defaultFieldState,
//                 visited: true,
//               },
//             },
//           },
//         };
//         action = { type: 'FORM_FOCUS', data: { formName, formKey, fieldName } };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });
//     });

//     describe('FORM_SETVIEW', () => {
//       it('should set the _view property', () => {
//         action = { type: 'FORM_SETVIEW', data: { formName, formKey, data: setViewData } };
//         desiredState = {
//           formName: {
//             formKey: {
//               ...initialState.formName.formKey,
//               _view: { ...setViewData },
//             },
//           },
//         };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });
//     });

//     describe('FORM_DESTROY', () => {
//       it('should set the form to it\'s default state', () => {
//         initialState = {
//           formName: {
//             formKey: {
//               ...defaultFormState,
//               _values: {
//                 value: 'value',
//               },
//             },
//           },
//         };
//         desiredState = {
//           formName: {
//             formKey: { ...defaultFormState },
//           },
//         };
//         action = { type: 'FORM_DESTROY', data: { formName, formKey } };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });
//     });

//     describe('FORM_INITIALIZE', () => {
//       it('should initialize the form with the fields provided', () => {
//         desiredState = {
//           formName: {
//             formKey: {
//               ...initialState.formName.formKey,
//               _values: {
//                 fieldName,
//                 fieldName2,
//               },
//               fieldName: {
//                 ...defaultFieldState,
//                 initial: 'fieldName',
//                 value: 'fieldName',
//               },
//               fieldName2: {
//                 ...defaultFieldState,
//                 initial: 'fieldName2',
//                 value: 'fieldName2',
//               },
//             },
//           },
//         };
//         action = { type: 'FORM_INITIALIZE', data: { formName, formKey, fields } };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });
//     });

//     describe('FORM_VALIDATE', () => {
//       it('should flag an error if field is not valid', () => {
//         initialState = {
//           formName: {
//             formKey: {
//               ...defaultFormState,
//               _values: {
//                 fieldName,
//               },
//               fieldName: { ...defaultFieldState },
//             },
//           },
//         };
//         desiredState = {
//           formName: {
//             formKey: {
//               ...initialState.formName.formKey,
//               _allValid: false,
//               _values: {
//                 fieldName: null,
//               },
//               fieldName: {
//                 ...defaultFieldState,
//                 valid: false,
//                 error: 'error',
//               },
//             },
//           },
//         };
//         const validateForm = () => {
//           return { fieldName: 'error' };
//         };
//         action = { type: 'FORM_VALIDATE', data: { formName, formKey, validate: validateForm } };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });

//       it('should clear errors if one isn\'t returned for a field', () => {
//         initialState = {
//           formName: {
//             formKey: {
//               ...defaultFormState,
//               _values: {
//                 fieldName,
//               },
//               fieldName: { ...defaultFieldState },
//             },
//           },
//         };
//         desiredState = {
//           formName: {
//             formKey: {
//               ...initialState.formName.formKey,
//               _allValid: true,
//               _values: {
//                 fieldName: null,
//               },
//               fieldName: { ...defaultFieldState },
//             },
//           },
//         };
//         const validateForm = () => {
//           return {};
//         };
//         action = { type: 'FORM_VALIDATE', data: { formName, formKey, validate: validateForm } };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });

//       it('should mark the parent as _allValid false if the child is all are not valid in the child', () => {
//         initialState = {
//           formName: {
//             formKey: {
//               ...defaultFormState,
//               _children: [{ name: 'childFormName', key: 'childFormKey' }],
//             },
//           },
//           childFormName: {
//             childFormKey: {
//               ...defaultFormState,
//               _parents: [{ name: 'formName', key: 'formKey' }],
//               _values: {
//                 fieldName,
//               },
//               fieldName: { ...defaultFieldState },
//             },
//           },
//         };
//         desiredState = {
//           formName: {
//             formKey: {
//               ...initialState.formName.formKey,
//               _allValid: false,
//             },
//           },
//           childFormName: {
//             childFormKey: {
//               ...initialState.childFormName.childFormKey,
//               _allValid: false,
//               _values: {
//                 fieldName: null,
//               },
//               fieldName: {
//                 ...defaultFieldState,
//                 valid: false,
//                 error: 'error',
//               },
//             },
//           },
//         };
//         const validateForm = () => {
//           return { fieldName: 'error' };
//         };
//         action = { type: 'FORM_VALIDATE', data: { formName: childFormName, formKey: childFormKey, validate: validateForm } };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });

//     });

//     describe('FORM_ADD_CHILD', () => {
//       it('should add a reference to the form and to the parent', () => {
//         initialState = {
//           formName: {
//             formKey: { ...defaultFormState },
//           },
//           childFormName: {
//             childFormKey: { ...defaultFormState },
//           },
//         };
//         desiredState = {
//           formName: {
//             formKey: {
//               ...defaultFormState,
//               _children: [{ name: 'childFormName', key: 'childFormKey' }],
//             },
//           },
//           childFormName: {
//             childFormKey: {
//               ...defaultFormState,
//               _parents: [{ name: 'formName', key: 'formKey' }],
//             },
//           },
//         };
//         action = { type: 'FORM_ADD_CHILD', data: { formName, formKey, childFormName, childFormKey } };
//         expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//       });

//       it('should not add childern or parents if they already exists', () => {
//         initialState = {
//           formName: {
//             formKey: {
//               ...defaultFormState,
//               _children: [{ name: 'childFormName', key: 'childFormKey' }],
//             },
//           },
//           childFormName: {
//             childFormKey: {
//               ...defaultFormState,
//               _parents: [{ name: 'formName', key: 'formKey' }],
//             },
//           },
//         };
//         action = { type: 'FORM_ADD_CHILD', data: { formName, formKey, childFormName, childFormKey } };
//         expect(forms.reducer(initialState, action)).to.deep.equal(initialState);
//       });
//     });

//     it('should add a additional parent and child reference to the forms', () => {
//       initialState = {
//         formName: {
//           formKey: {
//             ...defaultFormState,
//             _children: [{ name: 'formOtherName', key: 'formOtherKey' }],
//           },
//         },
//         childFormName: {
//           childFormKey: {
//             ...defaultFormState,
//             _parents: [{ name: 'formOtherName', key: 'formOtherKey' }],
//           },
//         },
//         formOtherName: {
//           formOtherKey: { ...defaultFormState },
//         },
//       };
//       desiredState = {
//         formName: {
//           formKey: {
//             ...defaultFormState,
//             _children: [{ name: 'formOtherName', key: 'formOtherKey' }, { name: 'childFormName', key: 'childFormKey' }],
//           },
//         },
//         childFormName: {
//           childFormKey: {
//             ...defaultFormState,
//             _parents: [{ name: 'formOtherName', key: 'formOtherKey' }, { name: 'formName', key: 'formKey' }],
//           },
//         },
//         formOtherName: {
//           formOtherKey: { ...defaultFormState },
//         },
//       };
//       action = { type: 'FORM_ADD_CHILD', data: { formName, formKey, childFormName, childFormKey } };
//       expect(forms.reducer(initialState, action)).to.deep.equal(desiredState);
//     });

//     describe('Other action types', () => {
//       it('should return default state if the there is not input and the action isn\'t defined', () => {
//         desiredState = {};
//         action = { type: 'OTHER_ACTION' };
//         expect(forms.reducer(undefined, action)).to.deep.equal(desiredState);
//       });

//       it('_formKeyReducer shoud return default state if', () => {
//         desiredState = {};
//         action = { type: 'OTHER_ACTION' };
//         expect(forms._formKeyReducer(undefined, action)).to.deep.equal(desiredState);
//       });

//       it('_formReducer shoud return default state if', () => {
//         desiredState = { ...defaultFormState };
//         action = { type: 'OTHER_ACTION' };
//         expect(forms._formReducer(undefined, action)).to.deep.equal(desiredState);
//       });

//       it('_fieldReducer shoud return default state if', () => {
//         desiredState = { ...defaultFieldState };
//         action = { type: 'OTHER_ACTION' };
//         expect(forms._fieldReducer(undefined, action)).to.deep.equal(desiredState);
//       });

//     });


//   });
// });
