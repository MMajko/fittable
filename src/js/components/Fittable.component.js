/**
 * React component
 * @author Marián
 */

import Controls from './Controls.component';
import Timetable from './Timetable.component';

export default class Fittable extends React.Component
{
    /**
     * Renders the component
     */
    render()
    {
        return <div className="fittable-container">
            <Controls />
            <Timetable />
        </div>;
    }
}
