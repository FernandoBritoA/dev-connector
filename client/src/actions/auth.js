import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_PROFILE,
} from './types';
import axios from 'axios';
import { setAlert } from './alert';
import { setAuthToken } from '../utils/setAuthToken';

//Load User
export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    const res = await axios.get('/api/auth');
    dispatch({
      type: USER_LOADED,
      payload: res.data,
      //backend user, name, date -password
    });
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

//Register user
//! js-cookie -> token cookies, more secure
export const register = (userData) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  //userData already comes as an object, we just have to convert it to json
  const body = JSON.stringify(userData);
  try {
    //because we added the proxy, we can skip the http/...
    const res = await axios.post('api/users', body, config);
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data, //token we get back
    });
    dispatch(loadUser());
  } catch (error) {
    //error array we get from the backend check
    const errorsArray = error.response.data.errors;

    if (errorsArray) {
      errorsArray.forEach((err) => dispatch(setAlert(err.msg, 'danger', 5000)));
    }
    dispatch({
      type: REGISTER_FAIL,
    });
  }
};

//Login user
//! js-cookie -> token cookies, more secure
export const login = (userData) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  //userData already comes as an object, we just have to convert it to json
  const body = JSON.stringify(userData);
  try {
    //because we added the proxy, we can skip the http/...
    const res = await axios.post('api/auth', body, config);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data, //token we get back
    });
    dispatch(loadUser());
  } catch (error) {
    //error array we get from the backend check
    const errorsArray = error.response.data.errors;

    if (errorsArray) {
      errorsArray.forEach((err) => dispatch(setAlert(err.msg, 'danger', 5000)));
    }
    dispatch({
      type: LOGIN_FAIL,
    });
  }
};

//Logout / ClearProfile
export const logout = () => (dispatch) => {
  dispatch({ type: LOGOUT });
  dispatch({ type: CLEAR_PROFILE });
};
