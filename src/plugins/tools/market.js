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
    }

    update(){}

    render(){
        return $.div({classList: 'market btn btn-subtle', onClick: this.change.bind(this)},
            this.chart.market ? this.chart.market.title() : 'Select Market'
        );
    }

    change(){
        if(!this.chart.omnibar) return;

        this.chart.omnibar.search({
            name: 'Change Chart Market',
            placeholder: 'Search For a Market to Display on the Chart...',
            didConfirmSelection: market => this.chart.changeMarket(market),
            maxResultsPerCategory: 30,
            items: via.markets.all()
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
