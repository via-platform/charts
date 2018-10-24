//This file is a plugin that handles indicators on the chart. When a new indicator is selected,
//this file creates the layer. The layer may or may not be within a new panel, depending on the type of
//indicator selected.

//This file also manages the chart tool that allows users to select an indicator to add.

const {Disposable, CompositeDisposable, Emitter, etch} = require('via');
const ChartIndicator = require('../../chart-indicator');
const $ = etch.dom;

module.exports = class Indicator {
    static describe(){
        return {
            name: 'indicator'
        };
    }

    static instance(params){
        return new Indicator(params);
    }

    constructor({chart}){
        this.chart = chart;
        this.disposables = new CompositeDisposable();
        etch.initialize(this);

        this.disposables.add(this.chart.tools.add({element: this.element, location: 'left', priority: 4}));
        this.disposables.add(via.tooltips.add(this.element, {title: 'Add Indicator', placement: 'bottom', keyBindingCommand: 'charts:add-indicator'}));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:add-indicator', this.select.bind(this)));
    }

    update(){}

    render(){
        return $.div({classList: 'type toolbar-button caret', onClick: this.select.bind(this)}, 'Indicators');
    }

    select(){
        this.chart.omnibar.search({
            name: 'Add Chart Indicators',
            placeholder: 'Search For an Indicator...',
            didConfirmSelection: option => this.create(option.plugin),
            maxResultsPerCategory: 60,
            items: this.chart.manager.indicators.map(plugin => ({name: plugin.title, plugin}))
        });
    }

    create(plugin){
        const panel = plugin.panel ? this.chart.panels.create() : this.chart.center();
        panel.add(new ChartIndicator({plugin, chart: this.chart, panel}));
    }

    destroy(){
        this.disposables.dispose();
    }
}
