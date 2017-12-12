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
        const symbol = this.chart.getSymbol();
        return $.div({classList: 'symbol', onClick: this.change.bind(this)}, symbol ? symbol.identifier : 'No Symbol');
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
