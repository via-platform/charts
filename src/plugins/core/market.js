const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

module.exports = class Market {
    static describe(){
        return {
            name: 'market'
        };
    }

    static instance(params){
        return new Market(params);
    }

    constructor({chart}){
        this.chart = chart;
        this.disposables = new CompositeDisposable();
        etch.initialize(this);

        this.disposables.add(this.chart.tools.add({element: this.element, location: 'left', priority: 1}));
        this.disposables.add(this.chart.onDidChangeMarket(() => etch.update(this)));
        this.disposables.add(via.tooltips.add(this.element, {title: 'Change Market', placement: 'bottom', keyBindingCommand: 'charts:change-market'}));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:change-market', this.select.bind(this)));
    }

    update(){}

    render(){
        return $.div({classList: 'market toolbar-button', onClick: this.select.bind(this)},
            this.chart.market ? this.chart.market.name : 'Select Market'
        );
    }

    select(){
        this.chart.omnibar.search({
            name: 'Change Chart Market',
            placeholder: 'Search For a Market to Display on the Chart...',
            didConfirmSelection: selection => this.chart.changeMarket(selection.market),
            maxResultsPerCategory: 60,
            items: via.markets.tradeable().map(m => ({name: m.title, group: m.active ? 'active' : 'inactive', description: m.description, market: m}))
        });
    }

    create(plugin){
        const panel = plugin.panel ? this.chart.panels.add() : this.chart.center();
        panel.add(new ChartIndicator({plugin, chart: this.chart, panel}));
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
    }
}
