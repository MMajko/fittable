/**
 * React component
 * @author Marián
 */

export default class EventDetail extends React.Component
{
    constructor( props )
    {
        super.constructor( props );
    }

    /**
     * Renders the component
     */
    render()
    {
        return <div className="detail">
            <div className="row properties">
                <div className="column small-6"><i className="fa fa-thumb-tack fa-fw"></i> č. {this.props.data.details.parallel}</div>
                <div className="column small-6 text-right">{this.props.data.details.teacher} <i className="fa fa-male fa-fw"></i></div>
            </div>
            <div className="row properties">
                <div className="column small-6"><i className="fa fa-group fa-fw"></i> <a href="#"> {this.props.data.details.students.length} studentů </a></div>
                <div className="column small-6 text-right">{this.props.data.details.capacity} <i className="fa fa-pie-chart fa-fw"></i></div>
            </div>
            <hr />
            <div className={'row cancellation' + ( this.props.data.cancelled ? '' : ' hide')}>
                <div className="column small-12">
                    <strong><i className="fa fa-ban fa-fw"></i> Paralelka bude nahrazena <a href="#">7.8 13:00</a></strong>
                    <hr />
                </div>
            </div>
            <div className={'row replacement' + ( this.props.data.replacement ? '' : ' hide')}>
                <div className="column small-12">
                    <strong><i className="fa fa-umbrella fa-fw"></i> Tato paralelka nahrazuje zrušenou</strong>
                    <hr />
                </div>
            </div>
            <div className="row">
                <div className="column small-12">
                    <strong>{this.props.data.note}</strong>
                    <div className="description">
                        {this.props.data.details.description}
                    </div>
                </div>
            </div>
            <div className="clearfix"></div>
        </div>;
    }
}
