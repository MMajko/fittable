/**
 * Component rendering whole timetable, containing hierarchy of week, day and events components.
 * @author Marián Hlaváč
 */

import Day from './Day.component';
import NowIndicator from './NowIndicator.component';
import Moment from '../../../node_modules/moment/moment.js';

export default class Timetable extends React.Component
{
    constructor( props )
    {
        super.constructor( props );

        this.state = {
            detailShownOn: -1,
            popupsOpened : 0
        };
    }

    /**
     * Replays the CSS animation of all events from right side to the left.
     */
    animateLeft()
    {
        var rootEl = this.refs.rootEl.getDOMNode();

        // Replay CSS animation
        rootEl.classList.remove("a-left");
        rootEl.classList.remove("a-right");
        setTimeout( () => { rootEl.classList.add("a-left"); }, 50 );
    }

    /**
     * Replays the CSS animation of all events from left side to the right.
     */
    animateRight()
    {
        var rootEl = this.refs.rootEl.getDOMNode();

        // Replay CSS animation
        rootEl.classList.remove("a-left");
        rootEl.classList.remove("a-right");
        setTimeout( () => { rootEl.classList.add("a-right"); }, 50 );
    }

    /**
     * Changes the ID of currently displayed EventDetail.
     * @param key EventDetail to display
     */
    showDetailOn( key )
    {
        var prevkey = this.state.detailShownOn;

        // If it's called on the same event, close all.
        if ( key == this.state.detailShownOn ) key = -1;

        // Calculate num of shown popups
        var popups = this.state.popupsOpened;
        if ( prevkey == -1 && key != -1 ) popups++;
        if ( prevkey != -1 && key == -1 ) popups--;

        this.setState( { detailShownOn: key, popupsOpened: popups } );
    }

    /**
     * Renders the component
     */
    render()
    {
        var weekEvents = [ [], [], [], [], [], [], [] ],
            firstDayStart = new Moment( this.props.viewDate ).startOf( 'day' ),
            minClosestDiff = Infinity,
            closestEvent = null;

        // Timeline hours from - to
        var timelineHoursFrom = Math.floor( this.props.grid.starts ),
            timelineHoursTo = Math.floor( this.props.grid.ends ),
            timelineMinutesFrom = Math.floor( ( this.props.grid.starts - timelineHoursFrom ) * 60 ),
            timelineMinutesTo = Math.floor( ( this.props.grid.ends - timelineHoursTo ) * 60 );

        // Timeline length in milliseconds
        var timelineLength = new Moment( firstDayStart ).hour( timelineHoursTo ).minutes( timelineMinutesTo )
                        .diff( new Moment( firstDayStart ).hour( timelineHoursFrom ).minutes( timelineMinutesFrom ) );

        // Timeline grid length
        var timelineGridLength = this.props.grid.lessonDuration * 3600000 / timelineLength;

        // Make sure the weekEvents data are available...
        if ( typeof this.props.weekEvents !== 'undefined' && this.props.weekEvents !== null )
        {
            for ( var event of this.props.weekEvents )
            {
                var dateStart = new Moment( event.startsAt ), dateEnd = new Moment( event.endsAt );
                var dayStart = new Moment( event.startsAt ).startOf( 'day' )
                                            .hour( timelineHoursFrom ).minutes( timelineMinutesFrom );

                // Calculate event length and position, relative to timeline
                var eventLength = dateEnd.diff( dateStart );
                event._draw_length = eventLength / timelineLength;
                var eventStart = dateStart.diff( dayStart );
                event._draw_position = eventStart / timelineLength;

                // Sort events by day of week
                weekEvents[ dateStart.isoWeekday() - 1 ].push( event );

                // Search for closest event from now
                var diffwithnow = dateStart.diff( new Moment() );
                if ( diffwithnow < minClosestDiff && diffwithnow > 0 )
                {
                    minClosestDiff = diffwithnow;
                    closestEvent = event;
                }
            }
        }

        // Today
        var todayId = -1;
        var today = new Moment();
        if ( this.props.viewDate.isSame( today, 'isoWeek' ) )
        {
            todayId = today.isoWeekday() - 1;
        }

        // Create array of hour labels
        var hourlabels = [];
        for ( var i = 0; i < 1 / timelineGridLength - 1; i++ )
        {
            hourlabels.push( <div className="hour-label" style={{ width: timelineGridLength * 100 + '%', height: timelineGridLength * 100 + '%', left: i * timelineGridLength * 100 + '%', top: i * timelineGridLength * 100 + '%' }} >
                                    {i+1}
                                </div> );
        }

        return <div className={'table a-left ' + (this.state.popupsOpened > 0 ? 'muted ' : '' ) + this.props.layout + ( this.props.functionsOpened !== null ? ' cut' : '' )} ref="rootEl">
            <div className="grid-overlay">
                <div className="grid-wrapper">
                    <div className="grid hor" style={{ 'background-size': ( timelineGridLength * 100 ) + '% 100%' }}></div>
                    <div className="grid ver" style={{ 'background-size': '100% ' + ( timelineGridLength * 100 ) + '%' }}></div>
                </div>
            </div>
            <NowIndicator timelineStartHour={timelineHoursFrom} timelineStartMins={timelineMinutesFrom}
                timelineLength={timelineLength} viewDate={this.props.viewDate} closestEvent={closestEvent} />
            <div className="days" ref="days">
                <Day id="0" dayNum="18" events={weekEvents[0]} onDetailShow={this.showDetailOn.bind(this)}
                    showDetailOn={this.state.detailShownOn} displayFilter={this.props.displayFilter} active={todayId == 0} />
                <Day id="1" dayNum="19" events={weekEvents[1]} onDetailShow={this.showDetailOn.bind(this)}
                    showDetailOn={this.state.detailShownOn} displayFilter={this.props.displayFilter} active={todayId == 1} />
                <Day id="2" dayNum="20" events={weekEvents[2]} onDetailShow={this.showDetailOn.bind(this)}
                    showDetailOn={this.state.detailShownOn} displayFilter={this.props.displayFilter} active={todayId == 2} />
                <Day id="3" dayNum="21" events={weekEvents[3]} onDetailShow={this.showDetailOn.bind(this)}
                    showDetailOn={this.state.detailShownOn} displayFilter={this.props.displayFilter} active={todayId == 3} />
                <Day id="4" dayNum="22" events={weekEvents[4]} onDetailShow={this.showDetailOn.bind(this)}
                    showDetailOn={this.state.detailShownOn} displayFilter={this.props.displayFilter} active={todayId == 4} />
                <Day id="5" dayNum="22" events={weekEvents[5]} onDetailShow={this.showDetailOn.bind(this)}
                    showDetailOn={this.state.detailShownOn} displayFilter={this.props.displayFilter} active={todayId == 5} />
                <Day id="6" dayNum="22" events={weekEvents[6]} onDetailShow={this.showDetailOn.bind(this)}
                    showDetailOn={this.state.detailShownOn} displayFilter={this.props.displayFilter} active={todayId == 6} />
            </div>
            <div className="clearfix"></div>
            <div className="hour-labels">
                {hourlabels.map( function( label ) { return label; } )}
            </div>
        </div>;
    }
}
