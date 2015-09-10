import moment from 'moment-timezone'
import { curry } from 'ramda'

import { TZ } from './constants'

export const now = () => Object.freeze(new Date())

export function isoDate (date) {
  return moment.tz(date, TZ).format('YYYY-MM-DD')
}

function momentWeekRange (date) {
  const m = moment.tz(date, TZ)

  const weekStart = m.clone().startOf('isoWeek')
  const weekEnd = m.clone().endOf('isoWeek')

  return [weekStart, weekEnd]
}

export function weekRange (date) {
  return momentWeekRange(date).map(m => m.toDate())
}

export function workWeekRange (date) {
  const [weekStart, weekEnd] = momentWeekRange(date)

  return [weekStart, weekEnd.subtract(2, 'days')].map(m => m.toDate())
}

export function isoWeekRange (date) {
  return weekRange(date).map(d => isoDate(d))
}

export const shiftDate = curry(function shiftDate (baseDate, kind, offset) {
  return moment.tz(baseDate, TZ).add(offset, kind).toDate()
})

export function weekdayNum (date) {
  // getDay returns 0 for Sunday, 1 Monday etc.
  // thus we need to shift by 6 and mod by 7
  return (date.getDay() + 6) % 7
}

export function compareDate (a, b) {
  const mA = moment(a)
  const mB = moment(b)
  if (mA.isBefore(mB, 'day')) {
    return -1
  }
  if (mA.isAfter(mB, 'day')) {
    return 1
  }

  return 0
}

export function withinDates (min, max, date) {
  const mDate = moment(date)
  return mDate.isBetween(min, max, 'day') || mDate.isSame(min, 'day') || mDate.isSame(max, 'day')
}
