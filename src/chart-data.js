const {Disposable, CompositeDisposable, Emitter} = require('via');

module.exports = class ChartData {
    constructor(chart){
        this.chart = chart;
        this.disposables = new CompositeDisposable();
        this.seriesDisposables = new Map();
        // this.series = {};

        this.disposables.add(this.chart.onDidChangeResolution(this.changedResolution.bind(this)));
        this.disposables.add(this.chart.center.onDidChangeDomain(this.changedDomain.bind(this)));
        this.disposables.add(this.chart.observeSeries(this.addedSeries.bind(this)));
        this.disposables.add(this.chart.onDidRemoveSeries(this.removedSeries.bind(this)));
    }

    addedSeries(series){
        let disposables = new CompositeDisposable();
        disposables.add(series.symbol.data.onDidModifyData(data => this.modifiedData(series, data)));

        if(series.realtime){
            //TODO open up a channel
        }

        this.seriesDisposables.set(series, disposables);
    }

    removedSeries(series){
        this.seriesDisposables.get(series).dispose();
        this.seriesDisposables.delete(series);
    }

    changedDomain(scale){
        // console.log('Changed domain');
        // console.log(scale.x.domain());
    }

    changedResolution(resolution){

    }

    onDidModifyData(callback){
        return this.emitter.on('did-modify-data', callback);
    }

    destroy(){
        this.disposables.dispose();
        this.seriesDisposables.clear();
    }
}
