const {Disposable, CompositeDisposable, Emitter} = require('via');
const ChartPanel = require('./chart-panel');

module.exports = class ChartPanels {
    serialize(){
        return this.panels.map(panel => panel.serialize());
    }

    constructor({chart, state}){
        this.chart = chart;
        this.disposables = new CompositeDisposable();
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
            this.panels.push(new ChartPanel({chart: this.chart, isCenter: true}));
        }

        for(let panel of this.panels){
            this.element.appendChild(panel.element);
        }
    }

    resize(dimensions){
        this.panels.forEach(panel => panel.resize(dimensions));
    }

    destroy(){
        this.disposables.dispose();
    }
}
