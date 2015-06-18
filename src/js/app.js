/**
 * Main application file of Fittable
 *  - Requires React.js to be loaded before loading this
 *
 *  @author Marián Hlaváč
 */

import Fittable from './components/Fittable.component';

import Counterpart from '../../node_modules/counterpart/index.js';
import Moment from '../../node_modules/moment/moment.js';
import Momentcslocale from '../../node_modules/moment/locale/cs.js';

import LocaleCS from '../lang/cs.json';
import LocaleEN from '../lang/en.json';

global.fittable = function ( containerElId, options )
{
    // Register translations
    Counterpart.registerTranslations( 'en', LocaleEN );
    Counterpart.registerTranslations( 'cs', Object.assign( LocaleCS, {
        counterpart: { pluralize: ( entry, count ) => entry[ (count === 0 && 'zero' in entry) ? 'zero' : (count === 1) ? 'one' : 'other' ] }
    } ) );

    // Set locale
    Counterpart.setLocale( options.locale );
    Moment.locale( options.locale );

    // Create root fittable element
    var element = React.createElement( Fittable, options );
    var rendered = React.render( element, document.getElementById( containerElId ) );

    // Return fittable instance
    return rendered;

};
