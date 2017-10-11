const {CompositeDisposable, Disposable, Emitter} = require('via');
const Chart = require('./chart');
const Plugins = require('./plugins');

const BaseURI = 'via://chart';

class ChartPackage {
    activate(){
        if(this.active){
            return;
        }

        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.plugins = new Plugins();
        this.active = true;
        this.charts = [];

        via.commands.add('via-workspace', {
            'chart:default': () => via.workspace.open(BaseURI)
        });

        this.disposables.add(via.workspace.addOpener((uri, options) => {
            if(uri.startsWith(BaseURI)){
                let chart = new Chart(this, this.plugins, options.state);

                this.charts.push(chart);
                this.emitter.emit('did-create-chart', chart);

                return chart;
            }
        }));

        this.plugins.initialize();
    }

    deactivate(){
        if(!this.active){
            return;
        }

        this.plugins.deactivateAll();
        this.disposables.dispose();
        this.disposables = null;
        this.active = false;
    }

    getCharts(){
        return this.charts.slice();
    }

    observeCharts(callback){
        for(let chart of this.charts){
            callback(chart);
        }

        return this.onDidCreateChart(chart => callback(chart));
    }

    didAddSeries(chart, series){
        this.emitter.emit('did-add-series', {chart, series});
    }

    didRemoveSeries(chart, series){
        this.emitter.emit('did-remove-series', {chart, series});
    }

    didModifySeries(chart, series){
        this.emitter.emit('did-modify-series', {chart, series});
    }

    observeSeries(callback){
        for(let chart of this.getCharts()){
            for(let series of chart.getSeries()){
                callback({chart, series});
            }
        }

        return this.onDidAddSeries(callback);
    }

    onDidAddSeries(callback){
        return this.emitter.on('did-add-series', callback);
    }

    onDidRemoveSeries(callback){
        return this.emitter.on('did-remove-series', callback);
    }

    onDidModifySeries(callback){
        return this.emitter.on('did-modify-series', callback);
    }

    onDidCreateChart(callback){
        return this.emitter.on('did-create-chart', callback);
    }

    onDidActivate(callback){
        return this.emitter.on('did-activate', callback);
    }

    onDidDeactivate(callback){
        return this.emitter.on('did-deactivate', callback);
    }

    provideCharts(){
        return this;
    }
}

module.exports = new ChartPackage();
