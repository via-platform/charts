const {Disposable, CompositeDisposable, Emitter} = require('via');
const d3 = require('d3');
const TICKS = 10;

module.exports = class ChartPanelGrid {
    constructor({chart, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
    }

    resize(){
        // this.axis
        // .attr('height', this.panel.height)
        // .attr('transform', `translate(${this.width - AXIS_WIDTH}, 0)`);
    }

    draw(){
        // this.axis.call(this.basis);
    }
}
