import renderer from './renderer.module.js';

/**
 @module fittable
 @brief I dunno yet
 */

export default class fittable
{
    constructor( elementName )
    {
        this.defaultElementName = elementName;
        this.DOMelement;
        this.renderer = new renderer();
        this.dataSource = null;

        window.addEventListener( 'load', () =>
            {
                this.DOMelement = document.getElementById( this.defaultElementName );
                this.renderer.render( this.DOMelement );
            });
    }

    getDOMelement()
    {
        return this.DOMelement;
    }

    setDataSource( dataSource )
    {
        this.dataSource = dataSource;
    }
}


