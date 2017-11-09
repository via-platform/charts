const {Disposable, CompositeDisposable, Emitter} = require('via');
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
        this.seriesDisposables = new Map();
        this.granularity = granularity;
        this.changedDomain = _.throttle(this.changedDomain.bind(this), 2000);
        this.source = null;

        this.disposables.add(this.chart.onDidChangeSymbol(this.changedSymbol.bind(this)));
        this.disposables.add(this.chart.onDidZoom(this.changedDomain.bind(this)));
    }

    changedSymbol(symbol){
        if(this.source){
            this.source.destroy();
        }

        this.source = symbol.data(this.granularity);
        this.changedDomain();
    }

    changedDomain(){
        const [start, end] = this.chart.scale.domain();
        this.source.request({start, end});
    }

    changedResolution(resolution){
        if(this.source){
            this.source.destroy();
        }

        this.source = symbol.data(this.granularity);
        this.changedDomain();
    }

    fetch(range){
        if(!this.source){
            return [];
        }

        return this.source.fetch(range);
    }

    onDidModifyData(callback){
        return this.emitter.on('did-modify-data', callback);
    }

    destroy(){
        this.disposables.dispose();
        this.seriesDisposables.clear();
    }
}
