const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');

class Type {
    constructor({chart, tools}){
        console.log('initialize type tool');
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.tools = tools;
        this.types = new Map();
        this.element = document.createElement('select');
        this.element.classList.add('type', 'input-select', 'mini');
        this.element.addEventListener('change', this.selected.bind(this));

        this.disposables.add(this.tools.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.chart.onDidChangeType(this.changed.bind(this)));

        this.initialize();
    }

    initialize(){
        const plugins = Array.from(this.chart.plugins.values()).filter(plugin => plugin.type === 'plot');

        for(let plugin of plugins){
            let name = plugin.name;
            let option = document.createElement('option');
            option.textContent = name;

            this.types.set(name, option);
            this.element.appendChild(option);
        }
    }

    selected(){
        this.chart.changeType(this.element.value);
    }

    changed(type){
        console.log('DID CHANGE');
        // this.element.textContent = symbol ? symbol.identifier : 'No Symbol';
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'type',
    type: 'tool',
    position: 'left',
    priority: 1,
    instance: params => new Type(params)
};
