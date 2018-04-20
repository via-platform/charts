const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

const options = {
    6e4: '1 Minute',
    18e4: '3 Minutes',
    3e5: '5 Minutes',
    6e5: '10 Minutes',
    9e5: '15 Minutes',
    18e5: '30 Minutes',
    36e5: '1 Hour',
    72e5: '2 Hours',
    108e5: '3 Hours',
    144e5: '4 Hours',
    216e5: '6 Hours',
    288e5: '8 Hours',
    432e5: '12 Hours',
    864e5: '1 Day',
    2592e5: '3 Days',
    6048e5: '1 Week'
};

const abbreviations = {
    6e4: '1m',
    18e4: '3m',
    3e5: '5m',
    6e5: '10m',
    9e5: '15m',
    18e5: '30m',
    36e5: '1h',
    72e5: '2h',
    108e5: '3h',
    144e5: '4h',
    216e5: '6h',
    288e5: '8h',
    432e5: '12h',
    864e5: '1D',
    2592e5: '3D',
    6048e5: '1W'
};

class Granularity {
    constructor({chart, tools}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.tools = tools;

        etch.initialize(this);

        this.disposables.add(this.chart.onDidChangeGranularity(this.didChangeGranularity.bind(this)));
        this.disposables.add(this.chart.onDidChangeMarket(this.didChangeMarket.bind(this)));
        this.disposables.add(this.tools.onDidDestroy(this.destroy.bind(this)));

        this.disposables.add(via.tooltips.add(this.element, {title: 'Change Granularity', placement: 'bottom', keyBindingCommand: 'charts:change-granularity'}));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:change-granularity', this.change.bind(this)));

        this.disposables.add(via.commands.add(this.chart.element, 'charts:increase-granularity', this.increase.bind(this)));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:decrease-granularity', this.decrease.bind(this)));

        this.didChangeMarket();
    }

    update(){}

    //TODO Combine the timeframes into an omnibar selection type deal
    render(){
        return $.div({classList: 'granularity toolbar-button caret', onClick: this.change.bind(this)}, abbreviations[this.chart.granularity] || 'N/A');
    }

    didChangeGranularity(granularity){
        etch.update(this);
    }

    didChangeMarket(){
        if(this.chart.market){
            this.element.classList.remove('hide');

            const timeframes = this.chart.market.exchange.timeframes;
            const valid = _.intersection(Object.keys(options), Object.keys(timeframes));

            if(!valid.indexOf(this.chart.granularity)){
                //The current granularity is no longer available for this symbol

            }
        }else{
            this.element.classList.add('hide');
        }
    }

    change(granularity){
        if(!this.chart.omnibar) return;
        if(!this.chart.market) return via.beep();

        const timeframes = this.chart.market.exchange.timeframes;
        const valid = _.intersection(Object.keys(options), Object.keys(timeframes));
        const items = valid.map(granularity => ({name: options[granularity], granularity}));

        this.chart.omnibar.search({
            name: 'Change Chart Market',
            placeholder: 'Search For a Market to Display on the Chart...',
            didConfirmSelection: option => this.chart.changeGranularity(parseInt(option.granularity)),
            maxResultsPerCategory: 30,
            items
        });
    }

    increase(){
        if(!this.chart.market) return via.beep();

        const timeframes = this.chart.market.exchange.timeframes;
        const valid = _.intersection(Object.keys(options), Object.keys(timeframes));
        const index = valid.indexOf(this.chart.granularity.toString());

        if(index >= valid.length - 1) return via.beep();

        this.chart.changeGranularity(parseInt(valid[index + 1]));
    }

    decrease(){
        if(!this.chart.market) return via.beep();

        const timeframes = this.chart.market.exchange.timeframes;
        const valid = _.intersection(Object.keys(options), Object.keys(timeframes));
        const index = valid.indexOf(this.chart.granularity.toString());

        if(!index) return via.beep();

        this.chart.changeGranularity(parseInt(valid[index - 1]));
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
    }
}

module.exports = {
    name: 'granularity',
    type: 'tool',
    position: 'left',
    priority: 0,
    instance: params => new Granularity(params)
};
