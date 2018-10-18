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

        this.disposables.add(this.chart.onDidChangeMarket(this.connect.bind(this)));
        this.disposables.add(this.chart.onDidChangeGranularity(this.connect.bind(this)));
        this.disposables.add(this.chart.onDidZoom(this.zoomed.bind(this)));

        console.log('INIT CORE DATA');
        this.connect();
    }

    connect(){
        if(this.data){
            this.subscription.dispose();
            this.subscription = null;
            this.data = null;
        }

        if(this.chart.market){
            this.data = this.chart.market.candles(this.chart.granularity);
            this.subscription = this.data.subscribe(this.didUpdateData.bind(this));
            this.request();
        }
    }

    request(){
        const [start, end] = this.chart.scale.domain();

        if(this.data){
            this.data.request({start, end});
        }
    }

    onDidUpdateData(callback){
        return this.emitter.on('did-update-data', callback);
    }

    destroy(){
        if(this.data){
            this.subscription.dispose();
            this.subscription = null;
            this.data = null;
        }

        this.disposables.dispose();
    }
}