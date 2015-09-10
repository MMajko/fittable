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

import FunctionsSidebar from '../../components/FunctionsSidebar'
import Spinner from '../../components/Spinner'
import Controls from '../../components/Controls'
import Timetable from '../../components/Timetable'
import ErrorMessage from '../../components/ErrorMessage'

// FIXME: move this to a separate module
function isSmallScreen () {
  return window.innerWidth <= 768
}

// Which part of the Redux global state does our component want to receive as props?
// FIXME: since the root component works with the whole global state, we may as well remove this
function mapStateToProps (state) {
  return {
    settings: state.settings,
    viewDate: state.viewDate,
    displayFilters: state.displayFilters,
    data: state.data,
    ui: state.ui,
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
  }
}

const FittableContainer = React.createClass({
  getInitialState () {
    return {
      // FIXME: this should be loaded dynamically from Sirius!
      grid: {
        starts: 7.5,
        ends: 21.5,
        lessonDuration: 0.875,
      },
      options: this.props,
      searchResults: [],
      error: false,
      errorType: null,
      mutedError: false,
      isMobile: isSmallScreen(),
    }
  },

  componentDidMount () {
    this.getWeekEvents()
  },

  // FIXME: too much logic. should be in selector, I guess
  getSemester (viewDate) {
    viewDate = moment(viewDate)
    let semestername
    let year = `${parseInt(viewDate.format('YYYY'), 10) - 1}/${viewDate.format('YY')}`
    if (viewDate.month() < 2) {
      semestername = CP.translate('winter_sem', {year: year})
    } else if (viewDate.month() < 10) {
      semestername = CP.translate('summer_sem', {year: year})
    } else {
      year = `${viewDate.format('YYYY')}/${moment(viewDate).add(1, 'year').format('YY')}`
      semestername = CP.translate('winter_sem', {year: year})
    }

    return semestername
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
    this.props.callbacks.dateChange(newdate.toISOString(), this.getSemester(newdate))

    // Update the data
    this.getWeekEvents(viewDate)
  },

  // FIXME: → mapDispatchToProps
  handleChangeView (to, param) {
    // Close all opened functions
    this.props.onSidebarDisplay(null)

    this.props.callbacks.viewChange(to, param)
  },

  // FIXME: → mapDispatchToProps
  handleSearch (query) {
    this.props.callbacks.search(query, this.receiveSearchResults)
  },

  render () {

    // FIXME: side effects!!!
    const { locale, layout, fullWeek, eventsColors, facultyGrid } = this.props.settings
    CP.setLocale(locale)
    moment.locale(locale)

    const { events, waiting, linkNames } = this.props.data
    const { sidebar } = this.props.ui

    // FIXME: this should be calculated by selector
    const gridsettings = {
      starts: this.state.grid.starts,
      ends: this.state.grid.ends,
      lessonDuration: (!facultyGrid ? 1 : this.state.grid.lessonDuration),
      hoursStartsAt1: facultyGrid,
      facultyHours: (this.state.grid.ends - this.state.grid.starts) / this.state.grid.lessonDuration,
      facultyGrid: facultyGrid,
    }

    return (
      <div className="fittable-container" ref="rootEl">
        <ErrorMessage
          muted={true}
          shown={this.state.mutedError}
          type={this.state.errorType}
        />
        <Controls
          viewDate={this.props.viewDate}
          onWeekChange={this.handleChangeViewDate}
          onDateChange={this.handleChangeViewDate}
          semester={this.getSemester(this.props.viewDate)}
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
          searchResults={this.state.searchResults}
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
          isMobile={this.state.isMobile}
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
