const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');

class Symbol {
    constructor({chart, tools}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.tools = tools;
        this.element = document.createElement('div');
        this.element.classList.add('symbol');
        this.element.textContent = 'No Symbol';

        this.change = this.change.bind(this);

        this.disposables.add(this.tools.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.chart.onDidChangeSymbol(this.changed.bind(this)));

        this.element.addEventListener('click', this.change);
        this.disposables.add(new Disposable(() => this.element.removeEventListener('click', this.change)));
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

    changed(symbol){
        this.element.textContent = symbol ? symbol.identifier : 'No Symbol';
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'symbol',
    type: 'tool',
    position: 'left',
    priority: 0,
    instance: params => new Symbol(params)
};
