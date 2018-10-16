const {CompositeDisposable, Disposable, Emitter} = require('via');
const Chart = require('./chart');
const base = 'via://charts';
const _ = require('underscore-plus');

const DefaultPlugins = require('./default-plugins');

const InterfaceConfiguration = {
    name: 'Interactive Chart',
    description: 'A real-time chart for a given symbol with various built-in indicators and overlays.',
    uri: base
};

class ChartPackage {
    initialize(){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.charts = [];
        this.plugins = [];
        this.drawings = [];
        this.indicators = [];
        this.plots = [];
        this.omnibar = null;

        this.disposables.add(via.commands.add('via-workspace, .symbol-explorer .market, .watchlist .market', 'charts:create-chart', this.create.bind(this)));

        this.disposables.add(via.workspace.addOpener((uri, options) => {
            if(uri === base || uri.startsWith(base + '/')){
                const chart = new Chart({manager: this, omnibar: this.omnibar}, {uri});

                for(const plugin of this.plugins){
                    plugin.instance({chart, manager: this});
                }

                this.charts.push(chart);
                this.emitter.emit('did-create-chart', chart);

                return chart;
            }
        }, InterfaceConfiguration));

        for(const [type, plugins] of Object.entries(DefaultPlugins)){
            for(const plugin of plugins){
                this[type](plugin);
            }
        }
    }

    deserialize(state){
        const chart = Chart.deserialize({manager: this, omnibar: this.omnibar}, state);

        for(const plugin of this.plugins){
            plugin.instance({chart, manager: this});
        }

        this.charts.push(chart);
        this.emitter.emit('did-create-chart', chart);

        return chart;
    }

    create(e){
        e.stopPropagation();

        if(e.currentTarget.classList.contains('market')){
            via.workspace.open(`${base}/market/${e.currentTarget.market.uri()}`, {});
        }else{
            via.workspace.open(base);
        }
    }

    deactivate(){
        for(const plugin of this.plugins.values()){
            this.deactivatePlugin(plugin);
        }

        this.disposables.dispose();
        this.disposables = null;
        this.active = false;
    }

    consumeActionBar(actionBar){
        this.omnibar = actionBar.omnibar;

        for(const chart of this.charts){
            chart.consumeActionBar(actionBar);
        }
    }

    getCharts(){
        return this.charts.slice();
    }

    provideCharts(){
        return this;
    }






    plugin(plugin){
        this.plugins.push(plugin);

        for(const chart of this.charts){
            plugin.instance({chart});
        }

        return new Disposable(() => _.remove(this.plugins, plugin));
    }

    drawing(plugin){
        this.drawings.push(plugin);
        return new Disposable(() => _.remove(this.drawings, plugin));
    }

    indicator(plugin){
        this.indicators.push(plugin);
        return new Disposable(() => _.remove(this.indicators, plugin));
    }

    plot(plugin){
        this.plots.push(plugin);
        return new Disposable(() => _.remove(this.plots, plugin));
    }








    observeCharts(callback){
        for(const chart of this.getCharts()){
            callback(chart);
        }

        return this.onDidCreateChart(chart => callback(chart));
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
}

module.exports = new ChartPackage();
