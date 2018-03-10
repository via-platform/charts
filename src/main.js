const {CompositeDisposable, Disposable, Emitter} = require('via');
const Chart = require('./chart');
const BaseURI = 'via://charts';

const DefaultPlugins = require('./default-plugins');

const InterfaceConfiguration = {
    name: 'Interactive Chart',
    description: 'A real-time chart for a given symbol with various built-in indicators and overlays.',
    uri: BaseURI
};

class ChartPackage {
    activate(){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.charts = [];
        this.plugins = new Map();
        this.pluginsSubscriptions = {};
        this.pluginsOrderMap = {};
        this.omnibar = null;

        via.commands.add('via-workspace', {
            'charts:create-chart': () => via.workspace.open(BaseURI)
        });

        this.disposables.add(via.workspace.addOpener((uri, options) => {
            if(uri === BaseURI || uri.startsWith(BaseURI + '/')){
                let chart = new Chart({manager: this, plugins: this.plugins, omnibar: this.omnibar}, {uri});

                this.charts.push(chart);
                this.emitter.emit('did-create-chart', chart);

                return chart;
            }
        }, InterfaceConfiguration));

        this.registerDefaultPlugins();
    }

    deactivate(){
        this.deactivateAllPlugins();
        this.disposables.dispose();
        this.disposables = null;
        this.active = false;
    }

    consumeActionBar(actionBar){
        this.omnibar = actionBar.omnibar;

        for(let chart of this.charts){
            chart.consumeActionBar(actionBar);
        }
    }

    getCharts(){
        return this.charts.slice();
    }

    provideCharts(){
        return this;
    }

    registerDefaultPlugins(){
        DefaultPlugins.forEach(plugin => this.disposables.add(this.registerPlugin(plugin)));
    }

    registerPlugin(plugin){
        this.plugins.set(plugin.name, plugin);
        this.emitter.emit('did-register-plugin', plugin);
        this.updatePluginActivationState(plugin);
        return new Disposable(() => this.unregisterPlugin(plugin));
    }

    unregisterPlugin(plugin){
        if(this.plugins.has(plugin.name)){
            this.plugins.delete(plugin.name);
            this.emitter.emit('did-unregister-plugin', plugin);
        }
    }

    updatePluginActivationState(plugin){
        // const plugin = this.plugins.get(plugin.name)
        // const pluginActive = plugin.isActive();
        // const settingActive = via.config.get(`charts.plugins.${name}`);
        //
        // this.activatePlugin(plugin);
    }

    activatePlugin(plugin){
        plugin.activatePlugin();
        this.emitter.emit('did-activate-plugin', plugin);
    }

    deactivatePlugin(plugin){
        plugin.deactivatePlugin();
        this.emitter.emit('did-deactivate-plugin', plugin);
    }

    deactivateAllPlugins(){
        for(let plugin of this.plugins.values()){
            this.deactivatePlugin(plugin);
        }
    }

    updatePluginsOrderMap(name){
        const orderSettingsKey = `charts.plugins.${name}DecorationsZIndex`;
        this.pluginsOrderMap[name] = via.config.get(orderSettingsKey);
    }

    getPluginsOrder(){
        return this.pluginsOrderMap;
    }

    getPlugin(name){
        return name ? this.plugins.get(name) : null;
    }

    observePlugins(callback){
        for(let plugin of this.plugins.values()){
            callback(plugin);
        }

        return this.onDidAddPlugin(plugin => callback(plugin));
    }

    onDidAddPlugin(callback){
        return this.emitter.on('did-add-plugin', callback);
    }

    onDidRemovePlugin(callback){
        return this.emitter.on('did-remove-plugin', callback);
    }

    onDidActivatePlugin(callback){
        return this.emitter.on('did-activate-plugin', callback);
    }

    onDidDeactivatePlugin(callback){
        return this.emitter.on('did-deactivate-plugin', callback)
    }

    onDidChangePluginOrder(callback){
        return this.emitter.on('did-change-plugin-order', callback);
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
}

module.exports = new ChartPackage();
