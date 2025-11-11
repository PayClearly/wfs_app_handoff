const defaultErrorStates = {
  fetchingError: undefined,
  updatingError: undefined,
  creatingError: undefined,
  deletingError: undefined,
  replacingError: undefined,
  validatingError: undefined,
  submittingError: undefined,
  initializingError: undefined,
};

// export const defaultState = {
  // fetching: undefined,
  // updating: undefined,
  // creating: undefined,
  // deleting: undefined,
  // validating: undefined,
  // submitting: undefined,
  // initializing: undefined
  // ...defaultErrorStates,

  // // is set to true when a FETCH_SUCCESS occurs
  // fetched: undefined,
  // validated: undefined,
  // submitted: undefined,
  // initialized: undefined,
  // updated: undefined,
// };

export function createStatusReducer(n) {

  const namespace = n.toUpperCase();
  let diff = {};

  return (state = { }, action) => {
    switch (action.type) {
      case `${namespace}_CLEAR`:
        diff = { };
        return { ...defaultErrorStates };

      case `${namespace}_CLEAR_ERRORS`:
        diff = { ...defaultErrorStates };
        return { ...state, ...diff };

      case `${namespace}_FETCH_START`:
        diff = {
          fetching: true,
          fetchingError: undefined,
        };
        return { ...state, ...diff };
      case `${namespace}_FETCH_SUCCESS`:
        diff = {
          fetching: undefined,
          fetchingError: undefined,
          fetched: true,
        };
        return { ...state, ...diff };
      case `${namespace}_FETCH_ERROR`:
        diff = {
          fetching: undefined,
          fetchingError: action.error,
        };
        return { ...state, ...diff };
      case `${namespace}_REPLACE_START`:
        diff = {
          replacing: true,
          replacingError: undefined,
        };
        return { ...state, ...diff };
      case `${namespace}_REPLACE_SUCCESS`:
        diff = {
          replacing: undefined,
          replacingError: undefined,
          replaced: true,
        };
        return { ...state, ...diff };
      case `${namespace}_UPDATE_START`:
        diff = {
          updating: true,
          updatingError: undefined,
        };
        return { ...state, ...diff };
      case `${namespace}_UPDATE_SUCCESS`:
        diff = {
          updated: action.id || action._id || action.data && (action.data.id || action.data._id) || true,
          updating: undefined,
          updatingError: undefined,
        };
        return { ...state, ...diff };
      case `${namespace}_UPDATE_ERROR`:
        diff = {
          updating: undefined,
          updatingError: action.error,
        };
        return { ...state, ...diff };

      case `${namespace}_CREATE_START`:
        diff = {
          creating: true,
          creatingError: undefined,
        };
        return { ...state, ...diff };
      case `${namespace}_CREATE_SUCCESS`:
        diff = {
          creating: undefined,
          creatingError: undefined,
          created: action.id || action._id || action.data && (action.data.id || action.data._id) || true,
        };
        return { ...state, ...diff };
      case `${namespace}_CREATE_ERROR`:
        diff = {
          creating: undefined,
          creatingError: action.error,
        };
        return { ...state, ...diff };

      case `${namespace}_DELETE_START`:
        diff = {
          deleting: true,
          deletingError: undefined,
        };
        return { ...state, ...diff };
      case `${namespace}_DELETE_SUCCESS`:
        diff = {
          deleting: undefined,
          deletingError: undefined,
        };
        return { ...state, ...diff };
      case `${namespace}_DELETE_ERROR`:
        diff = {
          deleting: undefined,
          deletingError: action.error,
        };
        return { ...state, ...diff };

      case `${namespace}_SUBMIT_START`:
        diff = {
          submitting: true,
          submittingError: undefined,
        };
        return { ...state, ...diff };
      case `${namespace}_SUBMIT_SUCCESS`:
        diff = {
          submitted: true,
          submitting: undefined,
          submittingError: undefined,
        };
        return { ...state, ...diff };
      case `${namespace}_SUBMIT_ERROR`:
        diff = {
          submitting: undefined,
          submittingError: action.error,
        };
        return { ...state, ...diff };

      case `${namespace}_VALIDATE_START`:
        diff = {
          validating: true,
          validatingError: undefined,
        };
        return { ...state, ...diff };
      case `${namespace}_VALIDATE_SUCCESS`:
        diff = {
          validating: undefined,
          validatingError: undefined,
          validated: true,
        };
        return { ...state, ...diff };
      case `${namespace}_VALIDATE_ERROR`:
        diff = {
          validating: undefined,
          validatingError: action.error,
        };
        return { ...state, ...diff };

      case `${namespace}_INITIALIZE_START`:
        diff = {
          initializing: true,
          initializingError: undefined,
        };
        return { ...state, ...diff };
      case `${namespace}_INITIALIZE_SUCCESS`:
        diff = {
          initializing: undefined,
          initializingError: undefined,
          initialized: true,
        };
        return { ...state, ...diff };
      case `${namespace}_INITIALIZE_ERROR`:
        diff = {
          initializing: undefined,
          initializingError: action.error,
        };
        return { ...state, ...diff };

      default:
        return state;
    }

  };
}

export function createActionTypes(namespace) {
  return {
    set: `${namespace}_SET`,
    clear: `${namespace}_CLEAR`,
    error: `${namespace}_ERROR`,
    clearErrors: `${namespace}_CLEAR_ERRORS`,
    fetchStart: `${namespace}_FETCH_START`,
    fetchSuccess: `${namespace}_FETCH_SUCCESS`,
    fetchError: `${namespace}_FETCH_ERROR`,
    updateStart: `${namespace}_UPDATE_START`,
    updateSuccess: `${namespace}_UPDATE_SUCCESS`,
    updateError: `${namespace}_UPDATE_ERROR`,
    createStart: `${namespace}_CREATE_START`,
    createSuccess: `${namespace}_CREATE_SUCCESS`,
    createError: `${namespace}_CREATE_ERROR`,
    deleteStart: `${namespace}_DELETE_START`,
    deleteSuccess: `${namespace}_DELETE_SUCCESS`,
    deleteError: `${namespace}_DELETE_ERROR`,
    replaceStart: `${namespace}_REPLACE_START`,
    replaceSuccess: `${namespace}_REPLACE_SUCCESS`,
    replaceError: `${namespace}_REPLACE_ERROR`,
    submitStart: `${namespace}_SUBMIT_START`,
    submitSuccess: `${namespace}_SUBMIT_SUCCESS`,
    submitError: `${namespace}_SUBMIT_ERROR`,
    validateStart: `${namespace}_VALIDATE_START`,
    validateSuccess: `${namespace}_VALIDATE_SUCCESS`,
    validateError: `${namespace}_VALIDATE_ERROR`,
    initializeStart: `${namespace}_INITIALIZE_START`,
    initializeSuccess: `${namespace}_INITIALIZE_SUCCESS`,
    initializeError: `${namespace}_INITIALIZE_ERROR`,
    linkStart: `${namespace}_LINK_START`,
    linkSuccess: `${namespace}_LINK_SUCCESS`,
    linkError: `${namespace}_LINK_ERROR`,
    unlinkStart: `${namespace}_UNLINK_START`,
    unlinkSuccess: `${namespace}_UNLINK_SUCCESS`,
    unlinkError: `${namespace}_UNLINK_ERROR`,
  };
}

export function reducerCreator(defaultState, actionName) {
  const setCase = `${actionName}_SET`;
  const clearCase = `${actionName}_CLEAR`;
  const errorCase = `${actionName}_ERROR`;

  return {
    reducer(state = defaultState, action) {
      switch (action.type) {
        case setCase:
          return { ...state, ...action.data };
        case errorCase:
          return { ...state, error: action.error };
        case clearCase:
          return defaultState;
        default:
          return state;
      }
    },
    clear() {
      const action = {
        type: clearCase,
      };
      return (dispatch) => {
        dispatch(action);
      };
    },
    set(data) {
      const action = {
        type: setCase,
        data,
      };
      return (dispatch) => {
        dispatch(action);
      };
    },
    error(error) {
      const action = {
        type: errorCase,
        error,
      };
      return (dispatch) => {
        dispatch(action);
      };
    },
  };
}


