//This file manages the chart tool that allows users to select a granularity for the chart.

const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');
const granularities = require('../chart-granularities');
const etch = require('etch');
const $ = etch.dom;

module.exports = class CoreGranularity {
    static describe(){
        return {
            name: 'core-granularity'
        };
    }

    static instance(params){
        return new CoreGranularity(params);
    }

    constructor({chart}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;

        console.log('INIT CORE GRANULARITY');


        // etch.initialize(this);
        //
        // this.disposables.add(this.chart.onDidChangeGranularity(this.didChangeGranularity.bind(this)));
        // this.disposables.add(this.chart.onDidChangeMarket(this.didChangeMarket.bind(this)));
        // this.disposables.add(this.tools.onDidDestroy(this.destroy.bind(this)));
        //
        // this.disposables.add(via.tooltips.add(this.element, {title: 'Change Granularity', placement: 'bottom', keyBindingCommand: 'charts:change-granularity'}));
        // this.disposables.add(via.commands.add(this.chart.element, 'charts:change-granularity', this.change.bind(this)));
        //
        // this.disposables.add(via.commands.add(this.chart.element, 'charts:increase-granularity', this.increase.bind(this)));
        // this.disposables.add(via.commands.add(this.chart.element, 'charts:decrease-granularity', this.decrease.bind(this)));
        //
        // this.didChangeMarket();
    }

    update(){}

    render(){
        return $.div({classList: 'granularity toolbar-button caret', onClick: this.change.bind(this)}, granularities[this.chart.granularity].abbreviation || 'N/A');
    }

    didChangeGranularity(granularity){
        etch.update(this);
    }

    didChangeMarket(){
        if(this.chart.market){
            this.element.classList.remove('hide');
        }else{
            this.element.classList.add('hide');
        }
    }

    change(granularity){
        if(!this.chart.omnibar) return;
        if(!this.chart.market) return via.beep();

        const timeframes = Object.entries(granularities);
        const items = timeframes.map(([granularity, config]) => ({name: config.title, granularity}));

        this.chart.omnibar.search({
            name: 'Change Chart Market',
            placeholder: 'Search For a Market to Display on the Chart...',
            didConfirmSelection: option => this.chart.changeGranularity(parseInt(option.granularity)),
            maxResultsPerCategory: 60,
            items
        });
    }

    increase(){
        if(!this.chart.market) return via.beep();

        const timeframes = Object.keys(granularities);
        const index = timeframes.indexOf(this.chart.granularity.toString());

        if(index >= timeframes.length - 1) return via.beep();

        this.chart.changeGranularity(parseInt(timeframes[index + 1]));
    }

    decrease(){
        if(!this.chart.market) return via.beep();

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