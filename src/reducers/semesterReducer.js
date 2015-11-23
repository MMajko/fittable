import { SEMESTER_LOAD_COMPLETED } from '../constants/actionTypes'

const initialState = {
  season: 'winter', // XXX: this is a placeholder
  grid: {
    // Fallback data for FIT
    starts: 7.5,
    ends: 21.5,
    lessonDuration: 0.875,
  },
  periods: [],
  valid: false,
  /*
  startsOn,
  endsOn,
  periods
  */
}

export default function semester (state = initialState, action) {
  switch (action.type) {
    case SEMESTER_LOAD_COMPLETED:
      return {
        ...state,
        ...action.payload,
      }
    default:
      return state
  }
}
