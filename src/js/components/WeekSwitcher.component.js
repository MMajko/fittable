/**
 * Week switcher is displayed after clicking on Week component. It contains three ways of
 * changing the displayed week. You can move it by one semester, one month or choose
 * exact week from calendar displayed in this dropdown.
 * @author Marián Hlaváč
 */

import React from 'react'
import Moment from 'moment'
import CP from 'counterpart'

import Toggleable from './Toggleable.component'

export default class WeekSwitcher extends Toggleable {

  /** Returns a Moment factory constructed from this.props.viewDate */
  viewDateMoment () {

    let moment = new Moment(this.props.viewDate)
    return function () {
      return moment.clone()
    }
  }

  renderSemesterSelector () {

    // Set a semester name
    let semesterName = this.props.semester
    let viewMoment = this.viewDateMoment()

    return (
      <div className="row weeksw-selector weeksw-semester-selector collapse">
        <div className="column small-3 gr-go">
          <button
            type="button"
            className="gr-go-btn"
            onClick={this.props.onDateChange.bind(this, viewMoment().subtract(6, 'months'), null)}
          >
            <i className="fa fa-chevron-left"></i>
          </button>
        </div>
        <div className="column small-6 active-item">
          {semesterName}
        </div>
        <div className="column small-3 gr-go">
          <button
            type="button"
            className="gr-go-btn"
            onClick={this.props.onDateChange.bind(this, viewMoment().add(6, 'months'), null)}
          >
            <i className="fa fa-chevron-right"></i>
          </button>
         </div>
       </div>
    )
  }

  renderMonthSelector () {

    let viewMoment = this.viewDateMoment()

    return (
      <div className="row weeksw-selector weeksw-month-selector collapse">
        <div className="column small-3 gr-go">
          <button
            type="button"
            className="gr-go-btn"
            onClick={this.props.onDateChange.bind(this, viewMoment().subtract(1, 'months').startOf('isoWeek'), null)}
          >
            <i className="fa fa-chevron-left"></i>
          </button>
        </div>
        <div className="column small-6 active-item">
          {viewMoment().format('MMMM')}
        </div>
        <div className="column small-3 gr-go">
          <button
            type="button"
            className="gr-go-btn"
            onClick={this.props.onDateChange.bind(this, viewMoment().add(1, 'months').startOf('isoWeek'), null)}
          >
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>
    )
  }

  /**
   * Renders the component
   */
  render () {

    let viewMoment = this.viewDateMoment()
    var weeks = [ [], [], [], [], [], [], [] ], moments = [ [], [], [], [], [], [], [] ]
    var monthEnd = viewMoment().endOf('month').endOf('isoWeek')
    var lastWeekIndex = 0, activeWeekIdx = -1

    // Create weeks of month array
    for (var i = viewMoment().startOf('month').startOf('isoWeek'), weeki = 0; i.isBefore(monthEnd); i.add(1, 'day')) {
      weeks[weeki].push(i.date())
      if (i.isoWeekday() === 7) {
        moments[weeki] = new Moment(i).startOf('isoWeek')
        weeki++
      }

      if (i.isSame(this.props.viewDate, 'week')) {
        activeWeekIdx = weeki
      }
      lastWeekIndex = weeki
    }

    function activeWeekClass (week) {
      // FIXME: this behaves differently in development and with Sirius; who's to blame?
      if (activeWeekIdx === (weeks.indexOf(week) + 1)) {
        return 'active-week'
      } else {
        return ''
      }
    }

    /**
     * Whether the given day is within the month of beginning of a given week.
     * Returns a class if yes.
     */
    function dayClass (week, day) {

      let weekIndex = weeks.indexOf(week)

      // if the day is in first week AND larger than > 7 OR last week AND smaller than 7
      if ((weekIndex === 0 && day > 7) || ((weekIndex === (lastWeekIndex - 1)) && day < 7)) {
        return 'in-other'
      } else {
        return ''
      }
    }

    function switchWeek (week) {

      var weekIndex = weeks.indexOf(week)
      var moment = moments[weekIndex]
      this.props.onDateChange.call(this, moment)
    }

    // FIXME: (╯°□°)╯︵ ┻━┻
    return (
      <div className="weeksw hide" ref="rootEl">
        {this.renderSemesterSelector()}
        {this.renderMonthSelector()}
        {weeks.map(function (week) {
          return (
            <div
              className={`row weeksw-selector weeksw-week-selector ${activeWeekClass(week)}`}
              key={weeks.indexOf(week)}
            >
              <div className="column small-12">
                {week.map(function (day) {
                  return (
                    <button
                      type="button"
                      className={ 'weeksw-day ' + dayClass(week, day)}
                      onClick={switchWeek.bind(this, week)}
                      key={weeks.indexOf(week) + '-' + day}
                    >
                      {day}
                    </button>
                  )
                }.bind(this))}
              </div>
            </div>
          )
        }.bind(this))}
      </div>
    )
  }
}
