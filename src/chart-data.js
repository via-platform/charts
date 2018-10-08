const {Disposable, CompositeDisposable, Emitter} = require('via');
const _ = require('underscore-plus');

module.exports = class ChartData {
    constructor(chart){
        this.chart = chart;
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.zoomed = _.throttle(this.request.bind(this), 3000);
        this.reference = {};

        this.disposables.add(this.chart.onDidChangeMarket(this.reset.bind(this)));
        this.disposables.add(this.chart.onDidChangeGranularity(this.reset.bind(this)));
        this.disposables.add(this.chart.onWillChangeGranularity(this.clear.bind(this)));
        this.disposables.add(this.chart.onDidZoom(this.zoomed.bind(this)));
    }

    clear(){
        if(this.data){
            this.subscription.dispose();
            this.subscription = null;
            this.data = null;
        }

        if(this.reference.market){
            this.reference.subscription.dispose();
            this.reference.subscription = null;
            this.reference.data = null;
        }
    }

    reset(){
        this.clear();

        if(!this.chart.market){
            return;
        }

        this.data = this.chart.market.candles(this.chart.granularity);
        this.subscription = this.data.subscribe(this.didUpdateData.bind(this));

        if(this.chart.market.reference_market_id){
            this.reference.market = via.markets.get(this.chart.market.reference_market_id);

            if(this.reference.market){
                this.reference.data = this.reference.market.candles(this.chart.granularity);
                this.reference.subscription = this.reference.data.subscribe(this.didUpdateData.bind(this));
            }
        }

        this.request();
    }

    request(){
        const [start, end] = this.chart.scale.domain();

        if(this.data){
            this.data.request({start, end});
        }

        if(this.reference.data){
            this.reference.data.request({start, end});
        }
    }

    fetch(range){
        return this.data ? this.data.fetch(range) : [];
    }

    candle(date = new Date()){
        return this.data ? this.data.candle(date) : {};
    }

    last(){
        return this.data ? this.data.last() : null;
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
