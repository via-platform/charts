const {Disposable, CompositeDisposable, Emitter} = require('via');
const ChartPanel = require('./chart-panel');

module.exports = class ChartPanels {
    serialize(){
        return this.panels.map(panel => panel.serialize());
    }

    constructor({chart, state}){
        this.chart = chart;
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.panels = [];

        this.element = document.createElement('div');
        this.element.classList.add('chart-panels');

        this.initialize(state);
        this.disposables.add(this.chart.onDidResize(this.resize.bind(this)));
    }

    initialize(state){
        if(state){
            for(let panel of state){
                this.panels.push(new ChartPanel({chart: this.chart, state: panel}));
            }
        }else{
            this.panels.push(new ChartPanel({chart: this.chart, isCenter: true, plugin: this.chart.getTypePlugin()}));
        }

        for(let panel of this.panels){
            this.element.appendChild(panel.element);
        }
    }

    addPanel(plugin){
        let panel = new ChartPanel({chart: this.chart, plugin});
        this.panels.push(panel);
        this.element.appendChild(panel.element);
        this.emitter.emit('did-add-panel', panel);
        this.resize();
    }

    resize(){
        this.panels.forEach(panel => panel.resize());
    }

    getCenter(){
        return this.panels.find(panel => panel.isCenter);
    }

    destroy(){
        this.disposables.dispose();
    }
}
