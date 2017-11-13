const {Disposable, CompositeDisposable, Emitter} = require('via');

module.exports = class ChartTools {
    serialize(){
        return {};
    }

    constructor({chart, state}){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();

        this.chart = chart;
        this.tools = [];

        this.element = document.createElement('div');
        this.element.classList.add('chart-tools');

        this.left = document.createElement('div');
        this.spacer = document.createElement('div');
        this.right = document.createElement('div');

        this.left.classList.add('chart-tools-left');
        this.spacer.classList.add('chart-tools-spacer');
        this.right.classList.add('chart-tools-right');

        this.element.appendChild(this.left);
        this.element.appendChild(this.spacer);
        this.element.appendChild(this.right);

        this.initialize();
    }

    initialize(){
        const plugins = Array.from(this.chart.plugins.values()).filter(plugin => plugin.type === 'tool');

        for(let plugin of plugins){
            let instance = plugin.instance({chart: this.chart, tools: this});

            this.tools.push(instance);
            plugin.position === 'right' ? this.right.appendChild(instance.element) : this.left.appendChild(instance.element);
        }
    }

    destroy(){
        this.disposables.dispose();
        this.emitter.emit('did-destroy');
    }

    onDidDestroy(callback){
        return this.emitter.on('did-destroy', callback);
    }
}
