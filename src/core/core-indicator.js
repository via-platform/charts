//This file is a plugin that handles indicators on the chart. When a new indicator is selected,
//this file creates the layer. The layer may or may not be within a new panel, depending on the type of
//indicator selected.

//This file also manages the chart tool that allows users to select an indicator to add.

module.exports = class CoreIndicator {
    static describe(){
        return {
            name: 'core-indicator'
        };
    }

    static instance(params){
        return new CoreIndicator(params);
    }

    constructor({chart}){
        this.chart = chart;
        this.type = via.config.get('charts.defaultChartType');

        console.log('INIT CORE INDICATOR');
    }

    changeType(type){
        if(this.type !== type){
            const plugin = this.plugins.get(type);
            this.type = type;
            this.root().initialize(plugin);
            this.emitter.emit('did-change-type', plugin);
            this.emitter.emit('did-change-title');
        }
    }
}