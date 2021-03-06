/**
 * Child component of EventBox, showing more information that won't fit into
 * EventBox. Shows after clicking on EventBox.
 */

import React, { PropTypes } from 'react'
import CP from 'counterpart'

import { EVENT_MAX_HEIGHT, EVENT_HEAD_HEIGHT } from '../constants/events'

const propTypes = {
  onViewChange: PropTypes.func,
  linkNames: PropTypes.object, // FIXME: validate shape
  data: PropTypes.object, // FIXME: validate shape
}

const Reveal = React.createClass({
  getInitialState () {
    return {
      open: false,
    }
  },

  onClick () {
    const open = this.state.open
    this.setState({open: !open})
  },

  render () {
    const open = this.state.open
    const {buttonDesc, buttonIconClass} = this.props
    const hideClass = open ? '' : 'hide'
    const caretClass = open ? 'fa-caret-up' : 'fa-caret-down'

    return (
        <div className="reveal-container">
          <button className="reveal" onClick={this.onClick}>
            <i className={`fa ${buttonIconClass}`}></i>
            <i className={`fa caret ${caretClass}`}></i> {buttonDesc}
          </button>
          <div className={`hideable ${hideClass}`}>
            {this.props.children}
          </div>
        </div>
      )
  },
})

class EventDetail extends React.Component {

  handleCourseClick (course) {
    this.props.onViewChange('course', course)
  }

  handleTeacherClick (teacher) {
    this.props.onViewChange('person', teacher)
  }

  handleRoomClick (room) {
    this.props.onViewChange('room', room)
  }

  getLinkName (type, key) {
    return this.props.linkNames[CP.getLocale()][type][key] || key
  }

  getEventName () {
    let name = this.props.data.name

    // Lectures, tutorials, and laboratories don't have name.
    if (name) {
      name = name[CP.getLocale()] || name.cs
    }
    // If event name is not set, use course name instead.
    if (!name) {
      name = this.getLinkName('courses', this.props.data.course)
    }
    return name
  }

  eventBasicProps () {
    const { data } = this.props
    const seqNumber = data.sequenceNumber || '?'

    const nameButton = (
      <button onClick={this.handleCourseClick.bind(this, data.course)}>
        {this.getEventName()}
      </button>
    )

    const locationButton = (
      <button onClick={this.handleRoomClick.bind(this, data.room)}>
        <i className="fa fa-map-marker"></i>
        {data.room}
      </button>
    )

    return (
      <div className="prop-section basic-props">
        <div className="type-num">
          {CP.translate(`event_type_num.${data.type}`, {seqnumber: seqNumber})}
        </div>
        <div className="name">
          {data.course ? nameButton : this.getEventName()}
        </div>
        <div className="location">
          {data.room ? locationButton : ''}
        </div>
      </div>
    )
  }

  eventNote () {
    const { note } = this.props.data

    if (note) {
      return (
        <div className="prop-section note">
          <div className="prop-title">
            {CP.translate('detail.note')}
          </div>
          {note[CP.getLocale()] || note.cs}
        </div>
      )
    }
  }

  eventExceptions () {
    const { appliedExceptions } = this.props.data.details

    if (appliedExceptions && appliedExceptions.length > 0) {
      const exceptionDesc = this.props.data.cancelled ? 'detail.cancelled' : 'detail.modified'

      return (
        <div className="prop-section exceptions">
          <Reveal
            buttonDesc={CP.translate(exceptionDesc)}
            buttonIconClass="fa-exclamation-triangle fa-fw ex-icon"
          >
            <div className="because">
              {CP.translate('detail.becauseof') }
            </div>
            {
              appliedExceptions.map((exception) => {
                const excObj = this.getLinkName('exceptions', exception)
                // FIXME: why the hell there is an object? broken data callback?
                const exceptionName = excObj.name || excObj
                return (
                  <div>
                    <strong>{exceptionName}</strong>
                  </div>
                )
              })
            }
          </Reveal>
        </div>
      )
    }
  }

  eventNumericProps () {
    const { details } = this.props.data

    const studentsPropField = this.numPropertyField(
      CP.translate('detail.students'), details.occupied)

    let capacityPropField = <div />
    if (details.capacity) {
      capacityPropField = this.numPropertyField(
        CP.translate('detail.capacity'), details.capacity, 'center')
    }

    let parallelPropField = <div />
    if (details.parallel) {
      parallelPropField = this.numPropertyField(
        CP.translate('detail.parallel'),
        CP.translate('detail.number', {num: details.parallel}),
        'right')
    }

    return (
      <div className="prop-section num-props">
       {studentsPropField}
       {capacityPropField}
       {parallelPropField}
      </div>
    )
  }

  eventTeachers () {
    return (
      <div className="prop-section teachers">
        {this.props.data.teachers.map(
          teacher => this.teacherField(teacher, this.getLinkName('teachers', teacher))
        )}
        <div className="prop-title">
          {CP.translate('detail.teachers') }
        </div>
      </div>
    )
  }

  numPropertyField (title, value, align = 'left') {
    return (
      <div className={ 'num-prop ' + align}>
        <div className="value">
          {value}
        </div>
        <div className="prop-title">
          {title}
        </div>
     </div>
    )
  }

  teacherField (username, fullname) {
    return (
      <div className="teacher" key={username}>
        <Reveal buttonDesc={fullname} buttonIconClass="fa-male">
          <a href={ 'https://usermap.cvut.cz/profile/' + username}>{CP.translate('detail.usermap_profile') }</a>
          <br />
          <button onClick={this.handleTeacherClick.bind(this, username) }>
            {CP.translate('detail.personal_calendar') }
          </button>
        </Reveal>
      </div>
    )
  }

  render () {
    return (
      <div className="detail" style={{maxHeight: EVENT_MAX_HEIGHT - EVENT_HEAD_HEIGHT}}>
        <div className="wrap">
          {this.eventBasicProps(this)}
          {this.eventNote(this)}
          {this.eventExceptions(this)}
          {this.eventNumericProps(this)}
          {this.eventTeachers(this)}
          <div className="clearfix"></div>
        </div>
      </div>
    )
  }
}

EventDetail.propTypes = propTypes

export default EventDetail
