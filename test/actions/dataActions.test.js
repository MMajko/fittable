import test from 'blue-tape'
import { spy } from 'sinon'
import * as actions from '../../src/actions/dataActions'
import {
  EVENTS_LOAD_STARTED,
  EVENTS_LOAD_COMPLETED,
  EVENTS_LOAD_FAILED,
  DATA_ERROR_HIDE,
} from '../../src/constants/actionTypes'

test('fetchEvents() executes a given callback with a week range', t => {
  const params = {
    type: 'courses',
    id: 'MI-RUB',
    date: '2015-09-09',
  }

  const expectedFrom = '2015-09-07'
  const expectedTo = '2015-09-13'

  const dataCallback = (actualParams, cb) => {
    t.equal(actualParams.dateFrom, expectedFrom, 'callback receives dateFrom string for a week start')
    t.equal(actualParams.dateTo, expectedTo, 'callback receives dateTo string for a week end')
    t.equal(typeof cb, 'function', 'callback receives a callback for response')
    t.end()
  }

  const thunk = actions.fetchEvents(dataCallback, params)
  const dispatch = () => {}

  t.equal(typeof thunk, 'function', 'fetchEvents returns a thunk function immediately')

  thunk(dispatch)
})

test('fetchEvents() dispatch', t => {
  const params = {
    type: 'courses',
    id: 'MI-RUB',
    date: '2015-09-09',
  }
  let dispatch = spy()

  const responseData = {
    events: ['event', 'event'],
    linkNames: {
      teachers: [
        {
          id: 'vomackar',
          name: {
            cs: 'Karel Vomáčka',
            en: 'Carl Vomacka',
          },
        },
      ],
    },
  }

  let callback = (passedParams, cb) => cb(null, responseData)
  let thunk = actions.fetchEvents(callback, params)
  thunk(dispatch)

  const expectedCalls = 2
  t.equal(dispatch.callCount, expectedCalls, `dispatch has been called ${expectedCalls} times`)

  t.test('fetchEvents() first dispatch', st => {
    const expectedArg = {type: EVENTS_LOAD_STARTED}
    const [actualArg,] = dispatch.firstCall.args
    st.deepEqual(actualArg, expectedArg, 'dispatches an EVENTS_LOAD_STARTED')
    st.end()
  })

  t.test('fetchEvents() second dispatch', st => {
    const expectedLinkNames = {
      cs: {
        teachers: {
          vomackar: 'Karel Vomáčka',
        },
        courses: {},
        exceptions: {},
      },
      en: {
        teachers: {
          vomackar: 'Carl Vomacka',
        },
        courses: {},
        exceptions: {},
      },
    }

    const {events} = responseData
    const expectedArg = {type: EVENTS_LOAD_COMPLETED, payload: {events, linkNames: expectedLinkNames}}
    const [actualArg,] = dispatch.secondCall.args
    st.deepEqual(actualArg, expectedArg, 'dispatches an EVENTS_LOAD_COMPLETED')
    st.end()
  })

  t.test('fetchEvents() failed events load', st => {
    const error = new Error('error message')
    error.type = 'generic'

    callback = (passedParams, cb) => cb(error)
    dispatch = spy()
    thunk = actions.fetchEvents(callback, params)

    thunk(dispatch)

    const [actualArg,] = dispatch.secondCall.args
    const expectedArg = {
      type: EVENTS_LOAD_FAILED,
      payload: error,
    }

    st.deepEqual(actualArg, expectedArg, 'dispatches EVENTS_LOAD_FAILED as second')
    st.end()
  })
})

test('hideDataError()', t => {
  const expected = {type: DATA_ERROR_HIDE, payload: {}}
  const actual = actions.hideDataError()
  t.deepEqual(actual, expected, 'dispatches DATA_ERROR_HIDE with empty payload')
  t.end()
})
