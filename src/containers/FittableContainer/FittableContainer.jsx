/**
 * Root component drawing whole widget.
 */

import React from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import CP from 'counterpart'

import { changeSettings } from '../../actions/settingsActions'
import { changeViewDate } from '../../actions/dateActions'
import { changeDisplayFilters } from '../../actions/filterActions'
import { fetchEvents } from '../../actions/dataActions'
import { displaySidebar } from '../../actions/uiActions'
import { fetchSearchResults } from '../../actions/searchActions'
import { fetchSemesterData } from '../../actions/semesterActions'
import { detectScreenSize } from '../../actions/clientActions'

import FunctionsSidebar from '../../components/FunctionsSidebar'
import Spinner from '../../components/Spinner'
import Controls from '../../components/Controls'
import Timetable from '../../components/Timetable'
import ErrorMessage from '../../components/ErrorMessage'

// Which part of the Redux global state does our component want to receive as props?
// FIXME: since the root component works with the whole global state, we may as well remove this
function mapStateToProps (state) {
  return {
    settings: state.settings,
    viewDate: state.viewDate,
    displayFilters: state.displayFilters,
    data: state.data,
    ui: state.ui,
    search: state.search,
    error: {
      type: state.data.error.type,
      visible: state.data.errorVisible,
    },
    semester: state.semester,
    grid: state.semester.grid,
    isMobile: state.client.smallScreen,
  }
}

// Which action creators does it want to receive by props?
function mapDispatchToProps (dispatch) {
  return {
    onSettingChange: (key, val) => dispatch(changeSettings({[key]: val})),
    onViewDateChange: (newDate) => dispatch(changeViewDate(newDate)),
    onDisplayFiltersChange: (filters) => dispatch(changeDisplayFilters(filters)),
    // FIXME: this one should be bound to onViewDateChange
    onEventsRequest: (callback, date) => dispatch(fetchEvents(callback, date)),
    onSidebarDisplay: (sidebar) => dispatch(displaySidebar(sidebar)),
    onSearchRequest: (callback, query) => dispatch(fetchSearchResults(callback, query)),
    // FIXME: bind this one to onViewDateChange too
    onSemesterDataRequest: (callback, date) => dispatch(fetchSemesterData(callback, date)),
    onWindowResize: () => dispatch(detectScreenSize()),
  }
}

const FittableContainer = React.createClass({
  componentDidMount () {
    this.getWeekEvents()
    this.getSemesterData()
    this.props.onWindowResize()
    global.window.addEventListener('resize', this.props.onWindowResize)
  },

  componentWillUnmount () {
    global.window.removeEventListener('resize', this.props.onWindowResize)
  },

  getSemesterData () {
    this.props.onSemesterDataRequest(this.props.callbacks.semesterData, this.props.viewDate)
  },

  // FIXME: too much logic. should be somewhere else
  getSemesterName () {
    if (!this.props.semester || !this.props.season || !this.props.semester.years) {
      return ''
    }

    const season = this.props.semester.season
    const [beginYear, endYear] = this.props.semester.years
    const translateKey = `${season}_sem`

    return CP.translate(translateKey, {year: `${beginYear}/${endYear}`})
  },

  // FIXME: this should be an implicit call with date change
  getWeekEvents (viewDate = null) {
    viewDate = viewDate || this.props.viewDate

    this.props.onEventsRequest(this.props.callbacks.data, viewDate)
  },

  // FIXME: deprecate callback
  handleChangeViewDate (viewDate) {
    // Update the viewDate state
    this.props.onViewDateChange(viewDate)

    // Update viewDate
    const newdate = moment(viewDate)
    // Send new date through callback
    this.props.callbacks.dateChange(newdate.toISOString(), this.getSemesterName())

    // Update the data
    this.getWeekEvents(viewDate)
  },

  // FIXME: → mapDispatchToProps
  handleChangeView (to, param) {
    // Close all opened functions
    this.props.onSidebarDisplay(null)

    this.props.callbacks.viewChange(to, param)
  },

  handleSearch (query) {
    this.props.onSearchRequest(this.props.callbacks.search, query)
  },

  render () {
    // FIXME: side effects!!!
    const { locale, layout, fullWeek, eventsColors, facultyGrid } = this.props.settings
    CP.setLocale(locale)
    moment.locale(locale)

    const { events, waiting, linkNames } = this.props.data
    const { sidebar } = this.props.ui

    const error = this.props.error

    // FIXME: this should be done some better way
    const gridsettings = {
      starts: this.props.grid.starts,
      ends: this.props.grid.ends,
      lessonDuration: (!facultyGrid ? 1 : this.props.grid.lessonDuration),
      hoursStartsAt1: facultyGrid,
      facultyHours: (this.props.grid.ends - this.props.grid.starts) / this.props.grid.lessonDuration,
      facultyGrid: facultyGrid,
    }

    return (
      <div className="fittable-container" ref="rootEl">
        <ErrorMessage
          muted={true}
          shown={error.visible}
          type={error.type}
        />
        <Controls
          viewDate={this.props.viewDate}
          onWeekChange={this.handleChangeViewDate}
          onDateChange={this.handleChangeViewDate}
          semester={this.getSemesterName()}
          onSettingsPanelChange={this.props.onSidebarDisplay}
          days7={fullWeek}
        />
        <div className="clearfix"></div>
        <FunctionsSidebar
          ref="sidebar"
          opened={sidebar}
          displayFilter={this.props.displayFilters}
          onFilterChange={this.props.onDisplayFiltersChange}
          onSettingChange={this.props.onSettingChange}
          settings={this.props.settings}
          onViewChange={this.handleChangeView}
          onSearch={this.handleSearch}
          searchResults={this.props.search.results}
        />
        <div className="clearfix"></div>
        <Timetable
          grid={gridsettings}
          viewDate={this.props.viewDate}
          layout={layout}
          weekEvents={events}
          displayFilter={this.props.displayFilters}
          functionsOpened={sidebar}
          onViewChange={this.handleChangeView}
          linkNames={linkNames}
          colored={eventsColors}
          days7={fullWeek}
          onDateChange={this.handleChangeViewDate}
          isMobile={this.props.isMobile}
          ref="timetable"
          visible={!waiting}
        />
        <Spinner show={waiting} />
      </div>
    )
  },
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FittableContainer)
