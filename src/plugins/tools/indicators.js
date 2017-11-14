const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');

class Indicators {
    constructor({chart, tools}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.tools = tools;
        this.element = document.createElement('div');
        this.element.classList.add('indicators');
        this.element.textContent = 'Indicators';

        this.disposables.add(this.tools.onDidDestroy(this.destroy.bind(this)));
        this.element.addEventListener('click', this.add.bind(this));
    }

    add(){
        let plugin = this.chart.plugins.get('sma');

        if(plugin.type === 'indicator'){
            this.chart.panels.addPanel(plugin);
        }else{
            this.chart.panels.getCenter().addLayer(plugin);
        }
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'indicators',
    type: 'tool',
    position: 'right',
    priority: 0,
    instance: params => new Indicators(params)
};
