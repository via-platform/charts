const {Disposable, CompositeDisposable, Emitter, Data} = require('via');
const _ = require('underscore-plus');

module.exports = class ChartData {
    static deserialize({chart, state}){
        return new ChartData({chart, granularity: state.granularity});
    }

    serialize(){
        return {
            granularity: this.granularity
        };
    }

    constructor({chart, granularity}){
        this.chart = chart;
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.granularity = granularity;
        this.changedDomain = _.throttle(this.changedDomain.bind(this), 2000);
        this.source = null;
        this.sourceDisposables = null;
        this.symbol = null;

        this.disposables.add(this.chart.onDidChangeSymbol(this.changedSymbol.bind(this)));
        this.disposables.add(this.chart.onDidChangeGranularity(this.changedGranularity.bind(this)));
        this.disposables.add(this.chart.onDidZoom(this.changedDomain.bind(this)));
    }

    changedSymbol(symbol){
        if(this.sourceDisposables){
            this.sourceDisposables.dispose();
        }

        this.symbol = symbol;
        this.sourceDisposables = new CompositeDisposable();
        this.source = new Data(this.symbol, this.granularity);
        this.sourceDisposables.add(this.source.onDidUpdateData(this.didUpdateData.bind(this)));

        this.changedDomain();
    }

    changedGranularity(granularity){
        if(granularity !== this.granularity){
            this.granularity = granularity;
            this.changedSymbol(this.symbol);
        }
    }

    changedDomain(){
        const [start, end] = this.chart.scale.domain();
        this.source.request({start, end});
    }

    fetch(range){
        if(!this.source){
            return [];
        }

        return this.source.fetch(range);
    }

    candle(date = new Date()){
        return this.source.candle(date);
    }

    last(){
        return this.source.last();
    }

    didUpdateData(){
        this.emitter.emit('did-update-data');
    }

    onDidUpdateData(callback){
        return this.emitter.on('did-update-data', callback);
    }

    destroy(){
        this.disposables.dispose();

        if(this.source){
            this.source.destroy();
        }

        if(this.sourceDisposables){
            this.sourceDisposables.dispose();
        }
    }
}
