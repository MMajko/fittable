/**
 * React component
 * @author Marián
 */

import Day from './Day.component';
import Moment from '../../../bower_components/moment/moment.js';

export default class Timetable extends React.Component
{
    constructor( props )
    {
        super.constructor( props );
    }

    animateLeft()
    {
        var rootEl = this.refs.rootEl.getDOMNode();

        // Replay CSS animation
        rootEl.classList.remove("a-left");
        rootEl.classList.remove("a-right");
        setTimeout( () => { rootEl.classList.add("a-left"); }, 50 );
    }

    animateRight()
    {
        var rootEl = this.refs.rootEl.getDOMNode();

        // Replay CSS animation
        rootEl.classList.remove("a-left");
        rootEl.classList.remove("a-right");
        setTimeout( () => { rootEl.classList.add("a-right"); }, 50 );
    }

    hideAllEventDetails( except )
    {

    }

    /**
     * Renders the component
     */
    render()
    {
        var weekEvents = [ [], [], [], [], [], [], [] ];
        var firstDayStart = new Moment( this.props.viewDate ).startOf( 'day' );

        // Timeline hours from - to
        var timelineHourFrom = 7;
        var timelineHourTo = 20;

        // Timeline lengths in milliseconds
        var timelineFrom = new Moment( firstDayStart ).diff( firstDayStart.hour( timelineHourFrom ) );
        var timelineLength = new Moment( firstDayStart ).hour( timelineHourTo ).diff( new Moment( firstDayStart ).hour( timelineHourFrom ) );

        if ( this.props.weekEvents !== null )
        {
            for ( var event of this.props.weekEvents )
            {
                var dateStart = new Moment( event.startsAt ), dateEnd = new Moment( event.endsAt );
                var dayStart = new Moment( event.startsAt ).startOf( 'day' ).hour( timelineHourFrom );

                // Calculate event length and position, relative to timeline
                var eventLength = dateEnd.diff( dateStart );
                event._draw_length = eventLength / timelineLength;
                var eventStart = dateStart.diff( dayStart );
                event._draw_position = ( eventStart ) / ( timelineLength );

                // Sort events by day of week
                weekEvents[ dateStart.isoWeekday() - 1 ].push( event );
            }
        }

        return <div className={'table a-left ' + this.props.layout} ref="rootEl">
            <div className="grid-overlay"><div className="grid"></div></div>
            <div className="days" ref="days">
                <Day id="0" dayNum="18" events={weekEvents[0]} onDetailShow={this.hideAllEventDetails.bind(this)} />
                <Day id="1" dayNum="19" events={weekEvents[1]} onDetailShow={this.hideAllEventDetails.bind(this)} />
                <Day id="2" dayNum="20" events={weekEvents[2]} onDetailShow={this.hideAllEventDetails.bind(this)} />
                <Day id="3" dayNum="21" events={weekEvents[3]} onDetailShow={this.hideAllEventDetails.bind(this)} />
                <Day id="4" dayNum="22" events={weekEvents[4]} onDetailShow={this.hideAllEventDetails.bind(this)} />
            </div>
            <div className="clearfix"></div>
        </div>;
    }
}
