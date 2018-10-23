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

module.exports = class CoreType {
    static describe(){
        return {
            name: 'core-type'
        };
    }

    static instance(params){
        return new CoreType(params);
    }

    constructor({chart}){
        this.chart = chart;
        this.disposables = new CompositeDisposable();

        etch.initialize(this);

        this.disposables.add(this.chart.root.onDidChangeType(() => etch.update(this)));
        this.disposables.add(this.chart.tools.add({element: this.element, location: 'left', priority: 1}));
        this.disposables.add(via.tooltips.add(this.element, {title: 'Change Chart Type', placement: 'bottom', keyBindingCommand: 'charts:change-type'}));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:change-type', this.select.bind(this)));
    }

    update(){}

    render(){
        return $.div({classList: 'type toolbar-button caret', onClick: this.select.bind(this)},
            this.chart.root.type ? this.chart.root.type.title : 'Select Chart Type'
        );
    }

    select(){
        this.chart.omnibar.search({
            name: 'Change Chart Type',
            placeholder: 'Select a Chart Type...',
            didConfirmSelection: option => this.chart.root.change(option.value),
            maxResultsPerCategory: 60,
            items: this.chart.manager.types.map(type => ({name: type.title, value: type}))
        });
    }

    destroy(){
        this.disposables.dispose();
    }
}