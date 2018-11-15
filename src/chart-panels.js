const {Disposable, CompositeDisposable, Emitter} = require('event-kit');
const d3 = require('d3');
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
    }

    all(){
        return this.panels.slice();
    }

    initialize(state){
        if(state){
            for(const panel of state){
                this.panels.push(new ChartPanel({chart: this.chart, panels: this, state: panel}));
            }
        }else{
            this.panels.push(new ChartPanel({chart: this.chart, panels: this, root: true}));
        }

        for(const panel of this.panels){
            this.element.appendChild(panel.element);
        }
    }

    add(){
        const panel = new ChartPanel({chart: this.chart, panels: this});
        this.panels.push(panel);
        this.element.appendChild(panel.element);
        this.emitter.emit('did-add-panel', panel);
        this.chart.resize();

        return panel;
    }

    remove(panel){
        if(panel.root){
            return void console.warn('You cannot remove the center panel.');
        }

        this.panels.splice(this.panels.indexOf(panel), 1);
        this.emitter.emit('did-remove-panel', panel);
        panel.destroy();
        this.chart.resize();
    }

    center(){
        return this.panels.find(panel => panel.root);
    }

    observePanels(callback){
        for(const panel of this.panels){
            callback(panel);
        }

        return this.onDidAddPanel(callback);
    }

    onDidAddPanel(callback){
        return this.emitter.on('did-add-panel', callback);
    }

    onDidRemovePanel(callback){
        return this.emitter.on('did-remove-panel', callback);
    }

    destroy(){
        for(const panel of this.panels){
            panel.destroy();
        }

        this.disposables.dispose();
    }
}
