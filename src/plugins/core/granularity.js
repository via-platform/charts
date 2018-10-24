//This file manages the chart tool that allows users to select a granularity for the chart.

const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');
const granularities = require('../../chart-granularities');
const etch = require('etch');
const $ = etch.dom;

module.exports = class Granularity {
    static describe(){
        return {
            name: 'granularity'
        };
    }

    static instance(params){
        return new Granularity(params);
    }

    constructor({chart}){
        this.chart = chart;
        this.disposables = new CompositeDisposable();
        etch.initialize(this);

        this.disposables.add(this.chart.tools.add({element: this.element, location: 'left', priority: 2}));
        this.disposables.add(this.chart.onDidChangeGranularity(() => etch.update(this)));
        this.disposables.add(via.tooltips.add(this.element, {title: 'Change Granularity', placement: 'bottom', keyBindingCommand: 'charts:change-granularity'}));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:change-granularity', this.select.bind(this)));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:increase-granularity', this.increase.bind(this)));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:decrease-granularity', this.decrease.bind(this)));
    }

    update(){}

    render(){
        return $.div({classList: 'granularity toolbar-button caret', onClick: this.select.bind(this)}, granularities[this.chart.granularity].abbreviation || 'N/A');
    }

    select(){
        this.chart.omnibar.search({
            name: 'Change Chart Granularity',
            placeholder: 'Select a Granularity...',
            didConfirmSelection: option => this.chart.changeGranularity(parseInt(option.granularity)),
            maxResultsPerCategory: 60,
            items: Object.entries(granularities).map(([granularity, config]) => ({name: config.title, granularity}))
        });
    }

    increase(){
        const timeframes = Object.keys(granularities);
        const index = timeframes.indexOf(this.chart.granularity.toString());

        if(index >= timeframes.length - 1) return via.beep();

        this.chart.changeGranularity(parseInt(timeframes[index + 1]));
    }

    decrease(){
        const timeframes = Object.keys(granularities);
        const index = timeframes.indexOf(this.chart.granularity.toString());

        if(!index) return via.beep();

        this.chart.changeGranularity(parseInt(timeframes[index - 1]));
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
    }
}
