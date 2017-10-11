"use jsx";

const {Emitter, CompositeDisposable, Disposable} = require('via');
const etch = require('etch');
const $ = etch.dom;
const Chart = require('via-chart');

module.exports = class ChartView {
    constructor() {
        this.emitter = new Emitter();
        this.disposables = new CompositeDisposable();
        this.loaded = false;

        etch.initialize(this);

        this.refs.tools.textContent = 'hello world';
    }

    destroy() {
        this.disposables.dispose();
        this.emitter.dispose();

        return etch.destroy(this);
    }

    render(){
        return <div class="chart">
            <div class="chart-tools" ref="tools"></div>
            <div class="chart-graphic" ref="graphic"></div>
        </div>;
    }

    update () {}

    // attachChart(){
    //     if(this.chart){
    //         this.chart.destroy();
    //     }
    //
    //     this.chart = new Chart();
    //     this.refs.chart.appendChild(this.chart.element);
    // }
}
