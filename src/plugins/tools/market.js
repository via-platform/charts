const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class Market {
    constructor({chart, tools}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.tools = tools;

        etch.initialize(this);

        this.disposables.add(this.tools.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.chart.onDidChangeMarket(this.changed.bind(this)));
        this.disposables.add(via.tooltips.add(this.element, {title: 'Change Market', placement: 'bottom', keyBindingCommand: 'charts:change-market'}));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:change-market', this.change.bind(this)));
    }

    update(){}

    render(){
        return $.div({classList: 'market toolbar-button', onClick: this.change.bind(this)},
            this.chart.market ? this.chart.market.title : 'Select Market'
        );
    }

    change(){
        if(!this.chart.omnibar) return;

        this.chart.omnibar.search({
            name: 'Change Chart Market',
            placeholder: 'Search For a Market to Display on the Chart...',
            didConfirmSelection: selection => this.chart.changeMarket(selection.market),
            maxResultsPerCategory: 60,
            items: via.markets.all().filter(m => m.active && m.type === 'SPOT').map(m => ({name: m.title, description: m.description, market: m}))
        });
    }

    changed(){
        etch.update(this);
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
    }
}

module.exports = {
    name: 'market',
    type: 'tool',
    position: 'left',
    priority: 0,
    instance: params => new Market(params)
};
