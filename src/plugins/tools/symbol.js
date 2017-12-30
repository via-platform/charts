const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class Symbol {
    constructor({chart, tools}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.tools = tools;

        etch.initialize(this);

        this.disposables.add(this.tools.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.chart.onDidChangeSymbol(this.changed.bind(this)));
    }

    update(){}

    render(){
        return $.div({classList: 'symbol', onClick: this.change.bind(this)}, this.format(this.chart.getSymbol()));
    }

    format(symbol){
        if(!symbol){
            return 'No Symbol';
        }

        let exchange = symbol.adapter && _.isFunction(symbol.adapter.title) ? symbol.adapter.title() : symbol.identifier.split(':').shift();

        return exchange + ' ' + symbol.name;
    }

    change(){
        if(this.chart.omnibar){
            this.chart.omnibar.search({
                name: 'Change Chart Symbol',
                placeholder: 'Enter a Symbol to Display on the Chart...',
                didConfirmSelection: selection => this.chart.changeSymbol(selection.symbol),
                maxResultsPerCategory: 10
            });
        }else{
            console.error('Could not find omnibar.');
        }
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
    name: 'symbol',
    type: 'tool',
    position: 'left',
    priority: 0,
    instance: params => new Symbol(params)
};
