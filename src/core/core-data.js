//This file is a plugin that handles chart data. The core-plot plugin and several others
//depend on core-data to watch the chart and request the desired candles from the market.
//This plugin may watch statistics in the future.

const {Disposable, CompositeDisposable, Emitter} = require('via');

module.exports = class CoreData {
    static describe(){
        return {
            name: 'core-data'
        };
    }

    static instance(params){
        return new CoreData(params);
    }

    constructor({chart}){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.chart = chart;
        this.zoomed = _.throttle(this.request.bind(this), 3000);

        this.disposables.add(this.chart.onDidChangeMarket(this.reset.bind(this)));
        this.disposables.add(this.chart.onDidChangeGranularity(this.reset.bind(this)));
        this.disposables.add(this.chart.onWillChangeGranularity(this.clear.bind(this)));
        this.disposables.add(this.chart.onDidZoom(this.zoomed.bind(this)));

        console.log('INIT CORE DATA');
    }
}