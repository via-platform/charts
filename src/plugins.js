const {CompositeDisposable, Disposable, Emitter} = require('via');

module.exports = class Plugins {
    constructor(){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.plugins = {};
        this.pluginsMetadata = {};
    }

    initialize(){
        this.plugins = {};
        this.pluginsMetadata = {};
        this.pluginsSubscriptions = {};
        this.pluginsOrderMap = {};
    }

    registerPlugin(name, plugin){
        this.plugins[name] = plugin;
        // this.pluginsMetadata[name] = plugin.getMetadata();
        this.pluginsSubscriptions[name] = new CompositeDisposable();
        this.emitter.emit('did-add-plugin', {name, plugin});
        this.updatePluginActivationState(name);
    }

    unregisterPlugin(name){
        let plugin = this.plugins[name];
        delete this.plugins[name];
        delete this.pluginsMetadata[name];
        this.emitter.emit('did-remove-plugin', {name, plugin});
    }

    updatePluginActivationState(name){
        const plugin = this.plugins[name];
        const pluginActive = plugin.isActive();
        const settingActive = via.config.get(`charts.plugins.${name}`);

        this.activatePlugin(name, plugin);
    }

    activatePlugin(name, plugin){
        plugin.activatePlugin();
        this.emitter.emit('did-activate-plugin', {name, plugin});
    }

    deactivatePlugin(name, plugin){
        plugin.deactivatePlugin();
        this.emitter.emit('did-deactivate-plugin', {name, plugin});
    }

    deactivateAllPlugins(){
        for(let [name, plugin] of Object.entries(this.plugins)){
            plugin.deactivatePlugin();
            this.emitter.emit('did-deactivate-plugin', {name, plugin});
        }
    }

    updatePluginsOrderMap(name){
        const orderSettingsKey = `charts.plugins.${name}DecorationsZIndex`;
        this.pluginsOrderMap[name] = atom.config.get(orderSettingsKey);
    }

    getPluginsOrder(){
        return this.pluginsOrderMap;
    }

    getPlugin(name){
        return name ? this.plugins[name] : null;
    }

    observePlugins(callback){
        for(let plugin of Object.values(this.plugins)){
            callback(plugin);
        }

        return this.onDidAddPlugin(({plugin}) => callback(plugin));
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
}
