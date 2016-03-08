/**
 * Component representing the event.
 */

import React, { PropTypes } from 'react'
import CP from 'counterpart'
import Moment from 'moment'

import { isScreenSmall, isScreenLarge } from '../screen'
import { EVENT_MAX_WIDTH, EVENT_HEAD_HEIGHT } from '../constants/events'

import EventDetail from './EventDetail'

const propTypes = {
  onViewChange: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  linkNames: PropTypes.object,
  colored: PropTypes.bool,
  layout: PropTypes.string,
  data: PropTypes.shape({
    id: PropTypes.number,
    course: PropTypes.string,
    appear: PropTypes.string,
    type: PropTypes.string,
  }),
  screenSize: PropTypes.number,
  expanded: PropTypes.bool,
  horizontalAlign: PropTypes.number,
  verticalAlign: PropTypes.number,
}

const defaultProps = {
  expanded: false,
}

function getPositionStyle ({layout, horizontalAlign, verticalAlign, data, expanded, screenSize}) {
  const length = data._length * 100 + '%'
  const position = data._position * 100 + '%'

  const layoutCanBeHorizontal = isScreenLarge(screenSize)
  const isHorizontal = layoutCanBeHorizontal && layout === 'horizontal'

  // Set default positioning
  let style = isHorizontal
      ? { width: length, left: position }
      : { height: length, top: position }

  // Set alignment styles
  if (expanded && horizontalAlign === 1) {
    style = {
      ...style,
      left: 'auto',
      right: '0',
    }
  }

  if (expanded && verticalAlign === 1) {
    let bottomPosition
    let bottomMargin

    if (layout === 'vertical') {
      bottomPosition = (1 - data._position) * 100 + '%' // inverse the percentage value (e.g. 20% -> 80%)
      bottomMargin = (-EVENT_HEAD_HEIGHT - 16) + 'px' // shift element by head height and paddings (4 x 4px)
    } else {
      bottomPosition = '0%' // just align to the bottom on horizontal layout
      bottomMargin = 0
    }

    style = {
      ...style,
      top: 'auto',
      bottom: bottomPosition,
      marginBottom: bottomMargin,
    }
  }

  return style
}

class EventBox extends React.Component {

  style (props) {
    const positionStyles = getPositionStyle(props)
    const { expanded, screenSize } = props

    if (expanded && !isScreenSmall(screenSize)) {
      return {
        ...positionStyles,
        maxWidth: EVENT_MAX_WIDTH,
      }
    } else {
      return positionStyles
    }
  }

  classNames (props) {
    const { data, expanded, colored } = props

    const cls = ['event', data._appear]
    if (expanded) {
      cls.push('is-opened')
    }
    if (data.cancelled) {
      cls.push('event--cancelled')
    }
    if (data.replacement) {
      cls.push('event--replacement')
    }

    if (colored) {
      cls.push(`event--${data.type}`)
    }

    return cls.join(' ')
  }

  displayTime (props) {
    const startsAt = new Moment(props.data.startsAt).format('LT')
    const endsAt = new Moment(props.data.endsAt).format('LT')

    return `${startsAt}—${endsAt}`
  }

  displayRoom (props) {
    return (
      <div>
        <i className="fa fa-map-marker"></i>
        {props.data.room}
      </div>
    )
  }

  eventDetail () {
    if (this.props.expanded) {
      return (
        <EventDetail
         ref="detail"
         data={this.props.data}
         onViewChange={this.props.onViewChange}
         linkNames={this.props.linkNames}
       />
      )
    }
  }

  render () {
    const { expanded, data, colored, onClick } = this.props

    const onClickVal = expanded ? null : data.id
    const headSpaceStyle = expanded ? {height: EVENT_HEAD_HEIGHT} : {}

    return (
      <div
        className={this.classNames(this.props)}
        style={this.style(this.props)}
      >
        <div className="inner">
          <div
            className="head-space"
            onClick={onClick.bind(null, onClickVal)}
            style={headSpaceStyle}>
            <div className="head-name">
              {data.course}
            </div>
            <div className="head-time">
              {this.displayTime(this.props)}
            </div>
            <div className="head-room">
              {this.displayRoom(this.props)}
            </div>
            <div className="head-type">
              <span className={`short ${colored ? ' hide' : ''}`}>
                {CP.translate('event_type_short.' + data.type)}
              </span>
            </div>
          </div>

          {this.eventDetail()}

          <div className="cancelflag">
            <i className="fa fa-ban"></i>
          </div>
          <div className="replaceflag">
            <i className="fa fa-plus"></i>
          </div>
        </div>
      </div>
    )
  }
}

EventBox.propTypes = propTypes
EventBox.defaultProps = defaultProps

export default EventBox
