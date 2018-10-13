const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const VS = require('./chart-vs');
const etch = require('etch');
const $ = etch.dom;

module.exports = class ChartIndicator {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;
        this.state = state;

        this.vs = new VS();
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