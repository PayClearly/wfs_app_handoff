import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';

const namespace = 'APPCONFIG';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  config: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    //     ...state,
    //   };

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
//     dispatch({ type: actionTypes.fetchStart });
//       dispatch({ type: actionTypes.fetchSuccess, data, paths });
//     });
//   };
// }

//     removeListeners(getState().integrationDefinitions.data.paths);
//     dispatch({ type: actionTypes.clear });
//   };
// }
