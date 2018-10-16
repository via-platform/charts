//This file is a plugin that handles the drawing of the main chart plot.
//As such, it cannot be deleted, but the layers it creates can be hidden.
//There is always a root layer, but this layer may change depending on the plugin used.
//This plugin is also responsible for adding the toolbar option to change the plot type.

//The reason that it makes sense to split this into a new plugin is that in the future
//we may be plotting data other than market date (e.g. statistics) as root-level
//data. Since this data may not have price_open, price_close, and so on, there may be
//special logic involved, depending on the market type.

const {CompositeDisposable} = require('via');

module.exports = class CorePlot {
    static describe(){
        return {
            name: 'core-plot'
        };
    }

    static instance(params){
        return new CorePlot(params);
    }

    constructor({chart, state}){
        this.chart = chart;
        this.disposables = new CompositeDisposable();
        this.type = via.config.get('charts.defaultChartType');
        console.log('INIT CORE PLOT');

        this.disposables.add(this.chart.onDidDestroy(this.destroy.bind(this)));


    }

    changeType(type){
        if(this.type !== type){
            const plugin = this.plugins.get(type);
            this.type = type;
            this.root().initialize(plugin);
        }
    }

    draw(){
        if(this.layer){
            this.chart.center().remove(layer);
        }

        this.chart.center().add({});
    }

    destroy(){
        this.disposables.dispose();
    }
}