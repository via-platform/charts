const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const VS = require('./chart-vs');
const etch = require('etch');
const $ = etch.dom;

//Get a description from the chart plugin of how many points are required / ranges / flags
//If the state is contains all of the necessary points, we have a complete shape and that's it
//Otherwise, we have to start a new shape from the first point that was given to us.
//We need to call the plugin's draw function with the points that we do have, as well as our generated
//flags and ranges.

//When the mouse is clicked, we have to record the points in real pixel terms.

//When the number of points reaches the number specified in the description, we are done
//and can dispose and disposables that were created during drawing.

//We must have a disposable that watches for core:cancel so that the drawing can be properly deleted if the
//escape key is pressed.

module.exports = class ChartDrawing {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;
        this.state = state;
    }

    calculate(){
        //Calculate new values based on updated chart data
        const data = ''; //Get the actual data from somewhere
        this.vs.update(data);
        this.draw();
    }

    draw(){
        //Use precalculated values to draw plots on the chart

    }

    destroy(){
        this.disposables.dispose();
    }
}
