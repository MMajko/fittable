/**
 * Fittable application
 *
 * This is the main javascript file for fittable app.
 * Implements callbacks using Sirius API as data source. Then initializes the fittable widget.
 *
 * @author      Marián Hlaváč
 * @version     1.0
 */

import ReactCookie from 'react-cookie'
import URL from 'url'
import R from 'ramda'

import { SIRIUS_PROXY_PATH } from '../config'

const emptyObject = (obj) => R.is(Object, obj) && R.pipe(R.keys, R.propEq('length', 0))

/**
 * Fittable widget instance
 */
var f

/**
 * Main application parameter, specifying the view
 * Choices are: person, room, course
 * @type {string}
 */
var view = 'person'

/**
 * Parameter for the selected view. Used for specifying the room or course.
 * @type {string}
 */
var parameter = ''

/**
 * Logged user's username.
 */
var username = ReactCookie.load('oauth_username')

/**
 * URL of proxy for Sirius API
 * @type {string}
 */
var siriusAPIUrl = `${getBaseUri()}${SIRIUS_PROXY_PATH}/`

/**
 * Currently selected application language setting
 * @type {string}
 */
var appLocale = 'cs'


var viewPaths = {
  course: 'courses',
  person: 'people',
  room: 'rooms',
}

// TODO: This should be removed!
var defaultLimit = 200

var STATUS_ERROR_TYPES = {
  0: 'connection',
  401: 'unauthorized',
  403: 'access',
  404: 'notfound',
  500: 'servererror'
}
function generateError (status, message = 'No message specified') {
  const error = new Error(message)
  if (status in STATUS_ERROR_TYPES) {
    error.type = STATUS_ERROR_TYPES[status]
    if (error.type === 'notfound' && view === 'person' && parameter === username) {
      error.type = 'own' + error.type
    }
  } else {
    error.type = 'generic'
  }
  return error
}


/**
 * @return {string} a base URI (aka relative URL root) of this site with
 * trailing slash omitted.
 */
function getBaseUri () {
  var baseUri = document.baseURI

  // IE doesn't support baseURI, workaround
  if (typeof baseURI === 'undefined') {
    var baseTag = document.getElementsByTagName("base")[0]
    baseUri = baseTag.href
  }

  return URL.parse(baseUri).pathname.replace(/\/$/, '')
}

function changeView (newView, newParam) {
  // Set new view
  view = newView
  parameter = newParam
}

function isUserLoggedIn () {
  return username && (
    // TODO: Remove oauth_access_token once we implement OAuth for dev-server.
    ReactCookie.load('oauth_refresh_token') || ReactCookie.load('oauth_access_token')
  )
}

function makeRequest (parameters) {
  var requestUrl = siriusAPIUrl

  requestUrl += parameters

  var request = new XMLHttpRequest()
  request.open('GET', encodeURI(requestUrl), true)
  request.send(null)

  return request
}

/**
 * Data callback, requesting the events from Sirius API, depending on view type and range.
 * @param params   Object with request parameters
 * @param callback Callback to be called after successful request
 */
function dataCallback ({calendarType, dateFrom, dateTo, calendarId}, callback) {
  // FIXME: until `me` is a valid shortcut on Sirius
  if (calendarId === 'me' && calendarType === 'people') {
    calendarId = username
  }

  const path = `${calendarType}/${calendarId}/events` +
    `?from=${dateFrom}&to=${dateTo}&limit=${defaultLimit}` +
    `&include=courses,teachers,schedule_exceptions&deleted=true`

  // Make the request
  const request = makeRequest(path)

  request.onreadystatechange = function (callback, fittable) {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        // Request successful
        var ajaxresult = JSON.parse(request.responseText)
        var itemCount = ajaxresult.meta.count

        var linknames = { teachers: [], courses: [], exceptions: [] }

        const responseEvents = ajaxresult.events || []
        const data = responseEvents.map(event => {
          // And add new event to array
          const newEvent = {
            id: event.id,
            name: event.name,
            course: event.links.course,
            startsAt: event.starts_at,
            endsAt: event.ends_at,
            sequenceNumber: event.sequence_number,
            type: event.event_type,
            room: event.links.room,
            flag: null,
            notification: false,
            cancelled: event.deleted,
            replacement: false,
            teachers: event.links.teachers,
            details: {
              students: event.links.students,
              capacity: event.capacity,
              parallel: event.parallel,
              appliedExceptions: event.links.applied_exceptions,
            },
          }

          // If the original data are present, insert one reverted event
          if (!emptyObject(event.original_data)) {
            // Convert times to milliseconds
            var rangeFromMs = (new Date(dateFrom)).getMilliseconds()
            var rangeToMs = (new Date(dateTo)).getMilliseconds()
            var originalFromMs = (new Date(event.original_data.starts_at)).getMilliseconds()

            // Check if the original start is between the range
            if (rangeFromMs <= originalFromMs && originalFromMs >= rangeToMs) {
              // The event is cancelled, show with original data
              newEvent.startsAt = event.original_data.starts_at
              newEvent.endsAt = event.original_data.ends_at
              newEvent.room = event.original_data.room_id
              newEvent.cancelled = true
              newEvent.replacedAt = event.starts_at
            } else {
              // The event is replacement
              newEvent.replacement = true
              newEvent.replaces = event.original_data.starts_at
            }
          }
          return newEvent
        })

        // Add teachers links full names
        if ('linked' in ajaxresult) {
          if ('teachers' in ajaxresult.linked) {
            for (let i = 0; i < ajaxresult.linked.teachers.length; i++) {
              // Add teacher link full name
              linknames.teachers.push({
                id: ajaxresult.linked.teachers[i].id,
                name: {
                  cs: ajaxresult.linked.teachers[i].full_name,
                  en: ajaxresult.linked.teachers[i].full_name,
                },
              })
            }
          }

          // Add courses links full names
          if ('courses' in ajaxresult.linked) {
            for (let i = 0; i < ajaxresult.linked.courses.length; i++) {
              // Add course link full name
              linknames.courses.push({
                id: ajaxresult.linked.courses[i].id,
                name: {
                  cs: ajaxresult.linked.courses[i].name.cs,
                  en: ajaxresult.linked.courses[i].name.en,
                },
              })
            }
          }

          // Add exceptions links full names
          if ('schedule_exceptions' in ajaxresult.linked) {
            for (let i = 0; i < ajaxresult.linked.schedule_exceptions.length; i++) {
              // Add exceptions link full name
              linknames.exceptions.push({
                id: ajaxresult.linked.schedule_exceptions[i].id,
                type: ajaxresult.linked.schedule_exceptions[i].exception_type,
                name: ajaxresult.linked.schedule_exceptions[i].name,
              })
            }
          }
        }

        // Send data to fittable
        callback(null, {events: data, linkNames: linknames})
      } else {
        // Request failed
        callback(generateError(request.status, 'dataCallback failed'))
      }
    }
  }.bind(null, callback, f)
}

/**
 * Search callback, returning search results from Sirius API.
 * @param query
 * @param callback
 */
var searchCallback = function (query, callback) {

  // Construct the request URL
  var request = makeRequest('search?q=' + query + '&limit=' + defaultLimit)

  request.onreadystatechange = function (callback, fittable) {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        // Request successful
        var ajaxresult = JSON.parse(request.responseText)

        // Send data to fittable
        callback(ajaxresult.results)
      } else {
        // Request failed
        fittable.onError(generateError(request.status).type)
      }
    }
  }.bind(null, callback, f)
}

var dateChangeCallback = function (newdate, newsemester) {
  console.log(newdate, newsemester)
  // Display semester name in subheading
  updateTitle(null, newsemester)
}

var semesterDataCallback = function (callback) {

  // Construct the request URL
  var request = makeRequest('semesters?limit=' + defaultLimit)

  request.onreadystatechange = function (callback, fittable) {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        // Request successful
        var ajaxresult = JSON.parse(request.responseText)
        var itemCount = ajaxresult.meta.count

        // Check if there is semesters object in result
        if (!('semesters' in ajaxresult)) {
          return false
        }

        var semesters = []

        // Create events from data
        for (var i = 0; i < itemCount; i++) {
          var semester = ajaxresult.semesters[i]

          // And add new semester to array
          semesters[ i ] = {
            id: semester.id,
            semester: semester.semester,
            faculty: semester.faculty,
            startsAt: semester.starts_at,
            endsAt: semester.ends_at,
            examsStartsAt: semester.exams_start_at,
            examsEndsAt: semester.exams_end_at,
            hourDuration: semester.hour_duration,
            breakDuration: 15,  // FIXME: replace this and that two below with semester.hourStarts
            dayStartsAtHour: 7.5,
            dayEndsAtHour: 21.25
          }
        }

        // Send semester data to fittable
        callback(semesters)
      } else {
        // Request failed
        fittable.onError(generateError(request.status).type)
      }
    }
  }.bind(null, callback, f)
}

var settingsChangeCallback = function (settings) {

  // We really don't want to save the user property
  settings.user = null

  // Update appLocale
  appLocale = settings.locale

  // Update title and subtitle for possible locale change
  updateTitle(view === 'person' && parameter === username ?
    viewNames[appLocale]['personal'] : viewNames[appLocale][view] + ' ' + parameter, null)
}

/**
 * --- Initialize the widget ---
 */

function viewChangeCallback (view, param) {
  console.error('viewChangeCallback fired!')
}

// If the user is not logged in, redirect him to the landing page
if (!isUserLoggedIn()) {
  window.location.href = 'landing.html'
}

function userCallback (cb) {
  const request = makeRequest(`people/${username}`)

  request.onreadystatechange = (callback, fittable) => {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        // Request successful
        const rawData = JSON.parse(request.responseText)

        if (!rawData || !rawData.people) {
          cb(generateError('generic'))
          return
        }

        const rawUser = rawData.people

        const data = {
          publicAccessToken: rawUser['access_token'],
          id: rawUser.id,
          name: rawUser.name,
        }

        cb(null, data)
      } else {
        // Request failed
        cb(generateError(request.status).type)
      }
    }
  }
}

export {
  dataCallback as data,
  searchCallback as search,
  dateChangeCallback as dateChange,
  semesterDataCallback as semesterData,
  settingsChangeCallback as settingsChange,
  viewChangeCallback as viewChange,
  userCallback as user,
}
