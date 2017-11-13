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

        this.disposables.add(this.tools.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.chart.onDidChangeSymbol(this.changed.bind(this)));
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
