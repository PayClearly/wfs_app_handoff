const defaultFormState = {
  _allValid: true,
  _allInitial: true,
  _children: [],
  _parents: [],
  _values: {},
  _view: {},
};

const defaultFieldState = {
  error: null,
  initial: null,
  touched: false,
  valid: true,
  validating: false,
  value: null,
  visited: false,
};

export function _fieldReducer(state = defaultFieldState, action) {
  let stateDiff = {};

  switch (action.type) {
    case 'FORM_BLUR':
      stateDiff = {
        visited: true,
        touched: true,
        focused: false,
      };
      return { ...state, ...stateDiff };
    case 'FORM_CHANGE':
      stateDiff = {
        visited: true,
        value: action.data.newValue,
      };
      return { ...state, ...stateDiff };
    case 'FORM_FOCUS':
      stateDiff = {
        visited: true,
        focused: true,
      };
      return { ...state, ...stateDiff };
    case 'FORM_INITIALIZE':
      stateDiff = {
        initial: action.data.initial,
        value: action.data.initial,
      };
      return { ...state, ...stateDiff };
    case 'FORM_ADD_FIELDS':
      stateDiff = {
        initial: action.data.initial,
        value: action.data.initial,
      };
      return { ...state, ...stateDiff };
    case 'FORM_RESET':
      stateDiff = {
        ...defaultFieldState,
        initial: state.initial,
        value: action.data.newValue !== undefined ? action.data.newValue : state.initial,
      };
      return { ...state, ...stateDiff };
    case 'FORM_VALIDATE':
      if (action.data.error) {
        stateDiff = {
          error: action.data.error,
          valid: false,
        };
        return { ...state, ...stateDiff };
      }
      stateDiff = {
        error: null,
        valid: true,
      };
      return { ...state, ...stateDiff };

    default:
      return state;
  }
}
export function _formReducer(state = defaultFormState, action) {
  let stateDiff = {};

  switch (action.type) {
    case 'FORM_BLUR':
    case 'FORM_CHANGE':
    case 'FORM_RESET':
    case 'FORM_FOCUS': {
      stateDiff = {};
      // Form field changes can be bundled
      if (action.data.fields) {
        const fields = action.data.fields;
        Object.keys(fields).forEach((fieldName) => {
          const derivedAction = {
            type: action.type,
            data: {
              fieldName,
              formKey: action.data.formKey,
              formName: action.data.formName,
              newValue: fields[fieldName],
            },
          };
          stateDiff[fieldName] = _fieldReducer(state[fieldName], derivedAction);
        });

      } else {
        stateDiff[action.data.fieldName] = _fieldReducer(state[action.data.fieldName], action);
      }
      return { ...state, ...stateDiff };
    }
    case 'FORM_SETVIEW': {
      stateDiff = {
        _view: { ...state._view, ...action.data.data },
      };
      return { ...state, ...stateDiff };
    }
    case 'FORM_DESTROY': {
      stateDiff = {
        _children: state._children,
        _parents: state._parents,
      };
      return { ...defaultFormState, ...stateDiff };
    }
    case 'FORM_INITIALIZE': {
      stateDiff = {};
      Object.keys(action.data.fields).forEach((key) => {
        stateDiff[key] = _fieldReducer(state[key], {
          type: 'FORM_INITIALIZE',
          data: { initial: action.data.fields[key] },
        });
      });
      return { ...state, ...stateDiff };
    }
    case 'FORM_ADD_FIELDS': {
      stateDiff = {};
      Object.keys(action.data.fields).forEach((key) => {
        stateDiff[key] = _fieldReducer(state[key], {
          type: 'FORM_ADD_FIELDS',
          data: { initial: action.data.fields[key] },
        });
      });
      return { ...state, ...stateDiff };
    }
    case 'FORM_REMOVE_FIELDS': {
      stateDiff = { ...state };
      action.data.fields.forEach((key) => {
        delete stateDiff[key];
      });
      return stateDiff;
    }
    case 'FORM_VALIDATE': {
      stateDiff = {};
      const errors = action.data.validate({ ...state._values });
      Object.keys(state._values).forEach((key) => {
        stateDiff[key] = _fieldReducer(state[key], { type: 'FORM_VALIDATE', data: { error: errors[key] } });
      });
      return { ...state, ...stateDiff };
    }
    case 'FORM_ADD_CHILD': {
      stateDiff = {};
      stateDiff._children = (state._children || []).slice();

      let doesChildExist = false;

      // check if the child already exits
      stateDiff._children.forEach((child) => {
        if (child.name === action.data.childFormName && child.key === action.data.childFormKey) {
          doesChildExist = true;
        }
      });

      if (!doesChildExist) {
        stateDiff._children.push({
          name: action.data.childFormName,
          key: action.data.childFormKey,
        });
      }

      return { ...state, ...stateDiff };
    }
    case 'FORM_ADD_PARENT': {
      stateDiff = {};
      stateDiff._parents = state._parents.slice();

      let doesParentExist = false;

      // check if the parent already exits
      stateDiff._parents.forEach((parent) => {
        if (parent.name === action.data.parentFormName && parent.key === action.data.parentFormKey) {
          doesParentExist = true;
        }
      });

      if (!doesParentExist) {
        stateDiff._parents.push({
          name: action.data.parentFormName,
          key: action.data.parentFormKey,
        });
      }

      return { ...state, ...stateDiff };
    }
    default:
      return state;
  }

}
export function _formKeyReducer(state = {}, action) {
  let stateDiff = {};

  switch (action.type) {

    case 'FORM_BLUR':
    case 'FORM_CHANGE':
    case 'FORM_FOCUS':
    case 'FORM_INITIALIZE':
    case 'FORM_VALIDATE':
    case 'FORM_ADD_CHILD':
    case 'FORM_ADD_PARENT':
    case 'FORM_DESTROY':
    case 'FORM_SETVIEW':
    case 'FORM_RESET':
    case 'FORM_ADD_FIELDS':
    case 'FORM_REMOVE_FIELDS':
      stateDiff = {};
      stateDiff[action.data.formKey] = _formReducer(state[action.data.formKey], action);
      return { ...state, ...stateDiff };

    default:
      return state;
  }
}

export function reducer(state = {}, action) {
  function updateMetaData(name, key, formState) {
    const stateDiff = {};
    const formDiff = {
      _allValid: true,
      _allInitial: true,
      _values: {},
      _name: name,
      _key: key,
    };

    Object.keys(_try(() => formState[name][key], {})).forEach((field) => {
      if (_try(() => Object.prototype.hasOwnProperty.call(formState[name][key][field], 'value'))) {
        formDiff._values[field] = formState[name][key][field].value;
        // check if all the fields are initial
        if (formDiff._values[field] !== formState[name][key][field].initial) {
          formDiff._allInitial = false;
        }
        if (!formState[name][key][field].valid) {
          formDiff._allValid = false;
        }
      }
    });

    // check the children to make sure they are up to date
    const children = _try(() => formState[name][key]._children, []);
    children.forEach((child) => {
      formDiff._allValid = formDiff._allValid && formState[child.name][child.key]._allValid;
      formDiff._allInitial = formDiff._allInitial && formState[child.name][child.key]._allInitial;
    });

    stateDiff[name] = { ...formState[name] };
    stateDiff[name][key] = { ...formState[name][key], ...formDiff };

    let newState = { ...formState, ...stateDiff };

    const parents = _try(() => formState[name][key]._parents, []);
    parents.forEach((parent) => {
      newState = updateMetaData(parent.name, parent.key, newState);
    });

    return newState;
  }

  function destroyForm(name, key, formState) {
    if (!_try(() => formState[name][key])) return formState;
    let stateDiff = { ...formState };
    const formsToUpdateAfterDestroy = [];

    // if form has parents, remove child from parents and mark them to update metadata
    if (_try(() => stateDiff[name][key]._parents && stateDiff[name][key]._parents.length)) {
      // Remove child reference from parents
      stateDiff[name][key]._parents.forEach((parent) => {
        if (!_try(() => stateDiff[parent.name][parent.key])) return;
        const updatedChildren = stateDiff[parent.name][parent.key]._children.slice();
        updatedChildren.splice(updatedChildren.findIndex(child => (child.name === name && child.key === key)), 1);
        stateDiff[parent.name] = { ...formState[parent.name] };
        stateDiff[parent.name][parent.key] = { ...formState[parent.name][parent.key] };
        stateDiff[parent.name][parent.key]._children = updatedChildren;

        formsToUpdateAfterDestroy.push({ name: parent.name, key: parent.key });
      });
    }
    // if form has children, remove parent reference from children
    if (_try(() => stateDiff[name][key]._children && stateDiff[name][key]._children.length)) {
      // remove parent reference from children
      stateDiff[name][key]._children.forEach((child) => {
        const updatedParents = stateDiff[child.name][child.key]._parents.slice();
        updatedParents.splice(updatedParents.findIndex((parent) => {
          return (parent.name === name && parent.key === key);
        }), 1);
        stateDiff[child.name] = { ...formState[child.name] };
        stateDiff[child.name][child.key] = { ...formState[child.name][child.key] };
        stateDiff[child.name][child.key]._parents = updatedParents;
      });
    }

    // remove form from store
    stateDiff[name] = { ...formState[name] };
    stateDiff[name][key] = { ...formState[name][key] };
    delete stateDiff[name][key];

    // Update metadata on relevant forms
    formsToUpdateAfterDestroy.forEach((form) => {
      stateDiff = updateMetaData(form.name, form.key, stateDiff);
    });

    return stateDiff;
  }

  let stateDiff = {};
  let newState = {};

  switch (action.type) {

    case 'FORM_BLUR':
    case 'FORM_CHANGE':
    case 'FORM_RESET':
    case 'FORM_FOCUS':
    case 'FORM_INITIALIZE':
    case 'FORM_VALIDATE':
    case 'FORM_SETVIEW':
    case 'FORM_ADD_FIELDS':
    case 'FORM_REMOVE_FIELDS':
      stateDiff = {};
      stateDiff[action.data.formName] = _formKeyReducer(state[action.data.formName], action);
      newState = { ...state, ...stateDiff };
      // update based on children and update parents
      newState = updateMetaData(action.data.formName, action.data.formKey, newState);
      return newState;
    case 'FORM_DESTROY':
      stateDiff = destroyForm(action.data.formName, action.data.formKey, state);
      return { ...stateDiff };
    case 'FORM_ADD_CHILD':

      stateDiff = {};
      stateDiff[action.data.formName] = _formKeyReducer(state[action.data.formName], action);
      stateDiff[action.data.childFormName] = _formKeyReducer(state[action.data.childFormName],
        {
          type: 'FORM_ADD_PARENT',
          data: {
            formName: action.data.childFormName,
            formKey: action.data.childFormKey,
            parentFormName: action.data.formName,
            parentFormKey: action.data.formKey,
          },
        });
      newState = { ...state, ...stateDiff };

      // update based on children and update parents
      newState = updateMetaData(action.data.childFormName, action.data.childFormKey, newState);

      return newState;

    default:
      return state;

  }
}
export default reducer;

export function blur(formName, formKey, fieldData) {
  if (typeof fieldData === 'string') {
    return { type: 'FORM_BLUR', data: { formName, formKey, fieldName: fieldData } };
  }
  return { type: 'FORM_BLUR', data: { formName, formKey, fields: fieldData } };
}

export function change(formName, formKey, fieldData, newValue) {
  if (typeof fieldData === 'string') {
    return { type: 'FORM_CHANGE', data: { formName, formKey, fieldName: fieldData, newValue } };
  }
  return { type: 'FORM_CHANGE', data: { formName, formKey, fields: fieldData } };
}

export function focus(formName, formKey, fieldName) {
  return { type: 'FORM_FOCUS', data: { formName, formKey, fieldName } };
}

export function destroy(formName, formKey) {
  return { type: 'FORM_DESTROY', data: { formName, formKey } };
}

export function initialize(formName, formKey, fields) {
  return { type: 'FORM_INITIALIZE', data: { formName, formKey, fields } };
}

export function reset(formName, formKey, fieldData) {
  return { type: 'FORM_RESET', data: { formName, formKey, fields: fieldData } };
}

export function setview(formName, formKey, data) {
  return { type: 'FORM_SETVIEW', data: { formName, formKey, data } };
}

export function validate(formName, formKey, validateForm) {
  return { type: 'FORM_VALIDATE', data: { formName, formKey, validate: validateForm } };
}

export function addChild(formName, formKey, childFormName, childFormKey) {
  return { type: 'FORM_ADD_CHILD', data: { formName, formKey, childFormName, childFormKey } };
}

export function addFields(formName, formKey, fields) {
  return { type: 'FORM_ADD_FIELDS', data: { formName, formKey, fields } };
}

export function removeFields(formName, formKey, fields) {
  return { type: 'FORM_REMOVE_FIELDS', data: { formName, formKey, fields } };
}
