/**
 * Wraps all controls displayed in the heading of widget.
 * Contains week controllers and functions tools.
 * @author Marián Hlaváč
 */

import React from 'react';
import Week from './Week.component';
import WeekNav from './WeekNav.component';
import FunctionsBar from './FunctionsBar.component';
import WeekSwitcher from './WeekSwitcher.component';

export default class Controls extends React.Component
{
    constructor( props )
    {
        super.constructor( props );
    }

    /**
     * Handles WeekNav's previous button click event
     */
    handlePrevClick()
    {
        // Different behaviour on different screens. Large up changes weeks, medium down changes active day
        if ( window.innerWidth > 768 )
            this.props.onWeekChange( this.props.viewDate.subtract( 1, 'week' ) );
        else
            this.props.onSelDayChange( -1 );
    }

    /**
     * Handles WeekNav's next button click event
     */
    handleNextClick()
    {
        // Different behaviour on different screens. Large up changes weeks, medium down changes active day
        if ( window.innerWidth > 768 )
            this.props.onWeekChange( this.props.viewDate.add( 1, 'week' ) );
        else
            this.props.onSelDayChange( 1 );
    }

    /**
     * Handles a click on a week row in the WeekSelector
     */
    handleWeekClick()
    {
        this.refs.weekSwitcher.toggle();
    }

    /**
     * Renders the component
     */
    render()
    {
        return <div className="header">
            <Week viewDate={this.props.viewDate} onClick={this.handleWeekClick.bind(this)} selectedDay={this.props.selectedDay} />
            <WeekNav onPrevClick={this.handlePrevClick.bind(this)} onNextClick={this.handleNextClick.bind(this)} />
            <WeekSwitcher viewDate={this.props.viewDate} ref="weekSwitcher" onDateChange={this.props.onDateChange}
                            semester={this.props.semester} />
            <FunctionsBar onPanelToggle={this.props.onSettingsPanelChange} />
        </div>;
    }
}
