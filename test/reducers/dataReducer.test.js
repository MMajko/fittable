import test from 'blue-tape'
import { EVENTS_LOAD_STARTED, EVENTS_LOAD_COMPLETED, EVENTS_LOAD_FAILED, DATA_ERROR_HIDE } from '../../src/constants/actionTypes'
import reducer from '../../src/reducers/dataReducer'

const INITIAL_STATE = {
  waiting: true,
  linkNames: {
    cs: { courses: {}, teachers: {}, exceptions: {} },
    en: { courses: {}, teachers: {}, exceptions: {} },
  },
  events: [],
  errorVisible: false,
  error: {
    type: null,
    message: null,
  },
}

test('data reducer initial state', t => {
  const actual = reducer(undefined, {type: null})
  const expectedLinkNames = {
    cs: { courses: {}, teachers: {}, exceptions: {} },
    en: { courses: {}, teachers: {}, exceptions: {} },
  }
  t.equal(actual.waiting, true, 'waiting is initially true')
  t.deepEqual(actual.events, [], 'events are empty')
  t.deepEqual(actual.linkNames, expectedLinkNames, 'initialises linkNames structure')
  t.deepEqual(actual.errorVisible, false, 'initialises with error hidden')
  t.deepEqual(actual.error, {type: null, message: null}, 'initialises with null error')
  t.end()
})

test('data reducer EVENTS_LOAD_STARTED action', t => {
  const state = {...INITIAL_STATE, waiting: false}

  const expected = {...state, waiting: true}
  const actual = reducer(state, {type: EVENTS_LOAD_STARTED})
  t.deepEqual(actual, expected, 'sets waiting to true')
  t.end()
})

test('data reducer EVENTS_LOAD_COMPLETED action', t => {
  const state = {
    ...INITIAL_STATE,
    waiting: true,
    errorVisible: true,
  }

  const events = [
    'some event',
    'other event',
  ]
  const linkNames = {
    cs: { teachers: {skocdop: 'Petr Skočdopole'}, exceptions: {}, courses: {} },
  }

  const expected = {
    ...state,
    waiting: false,
    errorVisible: false,
    events,
    linkNames,
  }
  const actual = reducer(state, {type: EVENTS_LOAD_COMPLETED, payload: {events, linkNames}})

  t.deepEqual(actual, expected, 'emits passed payload, sets waiting and errorVisible to false')
  t.end()
})

test('data reducer EVENTS_LOAD_FAILED action', t => {
  const state = {
    ...INITIAL_STATE,
    waiting: true,
    errorVisible: false,
  }

  const payload = new Error('Something failed')
  payload.type = 'generic'

  const actual = reducer(state, {type: EVENTS_LOAD_FAILED, payload})

  t.equal(actual.waiting, false, 'sets waiting to false')
  t.equal(actual.errorVisible, true, 'sets error visibility to true')
  t.equal(actual.error.type, 'generic', 'stores error type into state')
  t.equal(actual.error.message, 'Error: Something failed', 'sets error message by serialising the error')
  t.end()
})

test('data reducer DATA_ERROR_HIDE action', t => {
  const expected = {errorVisible: false}
  const actual = reducer({errorVisible: true},
    {type: DATA_ERROR_HIDE, payload: {}})
  t.deepEqual(actual, expected, 'hides an error message')
  t.end()
})
