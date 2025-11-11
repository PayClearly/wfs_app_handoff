import Cookies from 'js-cookie';

// Reducer //////////////////////////////////////////////////////////////////////////
const defaultState = {};

const SET = 'SET_COOKIES';
const EXPIRE = 'EXPIRE_COOKIES';

export function reducer(state = defaultState, action) {
  switch (action.type) {

    case SET: {
      return { ...state, ...action.data };
    }

    case EXPIRE: {
      const newState = { ...state };
      action.data.forEach((key) => {
        newState[key] = null;
      });
      return newState;
    }

    default: {
      return state;
    }
  }
}

export default reducer;

// HELPER
function getCookieValue(key) {
  let cookieValue = Cookies.get(key);
  if (cookieValue !== undefined) {
    if (cookieValue === 'true') {
      cookieValue = true;
    } else if (cookieValue === 'false') {
      cookieValue = false;
    } else if (key === 'CART_SUMMARY') {
      try {
        cookieValue = JSON.parse(decodeURIComponent(cookieValue.replace(/\+/g, '')));
      } catch (e) {
        console.log('There was an error parsing the CART_SUMMARY COOKIE');
      }
    }
  }
  return cookieValue;
}

// Action Creators //////////////////////////////////////////////////////////////////
/**
 * @function Cookies/set
 * @memberOf State
 * @param {State.Cookies}
 * @returns {State.Thunk}
 * @instance
*/
export function set(data) {
  return (dispatch) => {
    const cookieValues = {};
    Object.keys(data).forEach((key) => {
      cookieValues[key] = data[key].value;
      Cookies.set(key, data[key].value, data[key].options);
    });
    dispatch({ type: SET, data: cookieValues });
  };
}

export function updateCookie(key) {
  return (dispatch) => {
    const cookieValue = getCookieValue(key);
    dispatch({ type: SET, data: { [key]: cookieValue } });
  };
}

// Action Creators //////////////////////////////////////////////////////////////////
/**
 * @function Cookies/expire
 * @memberOf State
 * @param {string[]} cookie names to expire
 * @returns {State.Thunk}
 * @instance
*/
export function expire(data) {
  return (dispatch) => {
    data.forEach(() => {
      Cookies.remove(data.id);
    });
    dispatch({ type: EXPIRE, data });
  };
}

/**
 * @function Cookies/init
 * @description initilizes the cookies duck
 * @memberOf State
 * @returns {State.Thunk}
 * @instance
*/
export function init() {
  return (dispatch, getState) => {
    const newCookieValues = {};
    const currentCookies = getState().cookies;
    Object.keys(currentCookies).forEach((key) => {
      newCookieValues[key] = getCookieValue(key);
    });
    dispatch({ type: SET, data: newCookieValues });
  };
}
