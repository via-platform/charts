//This file is a plugin that handles the drawing of the main chart plot.
//As such, it cannot be deleted, but the layers it creates can be hidden.
//There is always a root layer, but this layer may change depending on the plugin used.
//This plugin is also responsible for adding the toolbar option to change the plot type.

//The reason that it makes sense to split this into a new plugin is that in the future
//we may be plotting data other than market date (e.g. statistics) as root-level
//data. Since this data may not have price_open, price_close, and so on, there may be
//special logic involved, depending on the market type.

const {CompositeDisposable} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

module.exports = class CorePlot {
    static describe(){
        return {
            name: 'core-plot'
        };
    }

    static instance(params){
        return new CorePlot(params);
    }

    constructor({chart}){
        this.chart = chart;
        this.disposables = new CompositeDisposable();

        etch.initialize(this);

        this.disposables.add(this.chart.root.onDidChangePlot(() => etch.update(this)));
        this.disposables.add(this.chart.tools.add({element: this.element, location: 'left', priority: 2}));
        this.disposables.add(via.tooltips.add(this.element, {title: 'Change Plot Type', placement: 'bottom', keyBindingCommand: 'charts:change-type'}));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:change-type', this.select.bind(this)));
    }

    update(){}

    render(){
        return $.div({classList: 'market toolbar-button', onClick: this.select.bind(this)}, 'Chart Type');
    }

    select(){
        this.chart.omnibar.search({
            name: 'Change Chart Type',
            placeholder: 'Select a Chart Type...',
            didConfirmSelection: option => this.chart.root.change(option.value),
            maxResultsPerCategory: 60,
            items: this.chart.manager.indicators.map(plugin => ({name: plugin.title, plugin}))
        });
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