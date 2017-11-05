const {Disposable, CompositeDisposable, Emitter} = require('via');

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
        this.granularity = granularity || 6e4;

        this.disposables.add(this.chart.onDidChangeSymbol(this.changedSymbol.bind(this)));

        // this.disposables.add(this.chart.center.onDidChangeDomain(this.changedDomain.bind(this)));
        // this.disposables.add(this.chart.observeSeries(this.addedSeries.bind(this)));
        // this.disposables.add(this.chart.onDidRemoveSeries(this.removedSeries.bind(this)));
    }

    changedSymbol(identifier){
        console.log("Changed the symbol to " + identifier);
    }

    changedDomain(scale){
        // console.log('Changed domain');
        // console.log(scale.x.domain());
    }

    changedResolution(resolution){

    }

    fetch(range){
        return [];
    }

    onDidModifyData(callback){
        return this.emitter.on('did-modify-data', callback);
    }

    destroy(){
        this.disposables.dispose();
        this.seriesDisposables.clear();
    }
}
