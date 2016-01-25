import { USER_LOAD_STARTED, USER_LOAD_COMPLETED } from '../constants/actionTypes'
import { fetchUser as userFetchCallback, logoutUser as userLogoutCallback } from '../callbacks'

function startUserRequest () {
  return {
    type: USER_LOAD_STARTED,
  }
}

function receiveUser (payload) {
  return {
    type: USER_LOAD_COMPLETED,
    payload,
  }
}

export function fetchUserData (dataCallback, weekDate) {
  return function thunk (dispatch) {
    dispatch(startUserRequest())

    userFetchCallback((error, result) => {
      if (error) {
        return dispatch(receiveUser(null))
      }
      dispatch(receiveUser(result))
    })
  }
}
