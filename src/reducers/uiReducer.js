import { SIDEBAR_DISPLAY, EVENT_DISPLAY } from '../constants/actionTypes'

const initialState = {
  sidebar: null,
  eventId: null,
}

export default function ui (state = initialState, action) {
  switch (action.type) {
    case SIDEBAR_DISPLAY:
      // FIXME: consider handling this in uiAction with thunk
      let {sidebar} = action.payload
      if (sidebar === state.sidebar) {
        sidebar = null
      }
      return {
        ...state,
        sidebar: sidebar,
      }
    case EVENT_DISPLAY:
      const {eventId} = action.payload
      return {
        ...state,
        eventId,
      }
    default:
      return state
  }
}
