import { SEMESTER_LOAD_COMPLETED } from '../constants/actionTypes'
import { findSemester, convertRawSemester, dateInSemester } from '../semester'
import { FACULTY_ID } from '../config'

function receiveSemesterData (semester) {
  return {
    type: SEMESTER_LOAD_COMPLETED,
    payload: semester,
  }
}

export function invalidateSemesterData (semester) {
  return {
    ...semester,
    valid: false,
  }
}

export function fetchSemesterData (semesterCallback, date) {
  return function semesterDataThunk (dispatch, getState) {
    const {semester} = getState()
    if (semester && semester.valid && dateInSemester(date, semester)) {
      return
    }

    semesterCallback(data => {
      if (!data) {
        dispatch(receiveSemesterData(invalidateSemesterData(semester)))
        return
      }

      const currentSemester = findSemester(data, date, FACULTY_ID)
      if (!currentSemester) {
        dispatch(receiveSemesterData(invalidateSemesterData(semester)))
        return
      }

      dispatch(receiveSemesterData(convertRawSemester(currentSemester)))
    })
  }
}
