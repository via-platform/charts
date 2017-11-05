const {CompositeDisposable, Disposable, Emitter} = require('via');
const Chart = require('./chart');
const BaseURI = 'via://chart';

const DefaultPlugins = require('./default-plugins');

class ChartPackage {
    activate(){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.charts = [];
        this.plugins = new Map();
        this.pluginsSubscriptions = {};
        this.pluginsOrderMap = {};

        via.commands.add('via-workspace', {
            'chart:default': () => via.workspace.open(BaseURI)
        });

        this.disposables.add(via.workspace.addOpener((uri, options) => {
            if(uri.startsWith(BaseURI)){
                let chart = new Chart(this.plugins, options.state);

                this.charts.push(chart);
                this.emitter.emit('did-create-chart', chart);

                return chart;
            }
        }));

        this.registerDefaultPlugins();
    }

    deactivate(){
        this.deactivateAllPlugins();
        this.disposables.dispose();
        this.disposables = null;
        this.active = false;
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
        let metadata = plugin.metadata();
        this.plugins.set(metadata.name, plugin);
        this.emitter.emit('did-register-plugin', plugin);
        this.updatePluginActivationState(plugin);
        return new Disposable(() => this.unregisterPlugin(plugin));
    }

    unregisterPlugin(plugin){
        let metadata = plugin.metadata();

        if(this.plugins.has(metadata.name)){
            this.plugins.delete(metadata.name);
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
