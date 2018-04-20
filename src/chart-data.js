const {Disposable, CompositeDisposable, Emitter} = require('via');
const _ = require('underscore-plus');

module.exports = class ChartData {
    constructor(chart){
        this.chart = chart;
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.zoomed = _.throttle(this.request.bind(this), 2000);
        this.data = null;

        this.disposables.add(this.chart.onDidChangeMarket(this.reset.bind(this)));
        this.disposables.add(this.chart.onDidChangeGranularity(this.reset.bind(this)));
        this.disposables.add(this.chart.onWillChangeGranularity(this.clear.bind(this)));
        this.disposables.add(this.chart.onDidZoom(this.zoomed.bind(this)));
    }

    clear(){
        if(this.data){
            this.data.destroy();
            this.data = null;
        }
    }

    reset(){
        this.clear();

        if(!this.chart.market || !this.chart.market.exchange.hasFetchOHLCV) return;

        this.data = this.chart.market.data(this.chart.granularity);
        this.data.onDidUpdateData(this.didUpdateData.bind(this));
        this.request();
    }

    request(){
        const [start, end] = this.chart.scale.domain();

        if(this.data){
            this.data.request({start, end});
        }
    }

    fetch(range){
        return this.data ? this.data.fetch(range) : [];
    }

    candle(date = new Date()){
        return this.data ? this.data.candle(date) : {};
    }

    last(){
        return this.data ? this.data.last() : {};
    }

    didUpdateData(){
        this.emitter.emit('did-update-data');
    }

    onDidUpdateData(callback){
        return this.emitter.on('did-update-data', callback);
    }

    onDidDestroy(callback){
        return this.emitter.on('did-destroy', callback);
    }

    destroy(){
        this.clear();
        this.disposables.dispose();
        this.emitter.emit('did-destroy');
        this.emitter.dispose();
    }
}
