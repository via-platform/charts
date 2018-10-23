const {Disposable, CompositeDisposable, Emitter, d3} = require('via');
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

        this.disposables.add(this.chart.onDidResize(this.resize.bind(this)));

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
            this.panels.push(new ChartPanel({chart: this.chart, panels: this, center: true}));
        }

        for(const panel of this.panels){
            this.element.appendChild(panel.element);
        }
    }

    create(){
        const panel = new ChartPanel({chart: this.chart, panels: this});
        this.panels.push(panel);
        this.element.appendChild(panel.element);
        this.emitter.emit('did-add-panel', panel);
        this.resize();

        return panel;
    }

    addPanel(plugin){
        const panel = new ChartPanel({chart: this.chart, panels: this, plugin});
        this.panels.push(panel);
        this.element.appendChild(panel.element);
        this.emitter.emit('did-add-panel', panel);
        this.resize();
    }

    removePanel(panel){
        this.panels.splice(this.panels.indexOf(panel), 1);
        this.emitter.emit('did-remove-panel', panel);
        panel.destroy();
        this.resize();
    }

    observePanels(callback){
        for(const panel of this.panels){
            callback(panel);
        }

        return this.onDidAddPanel(callback);
    }

    resize(){
        this.panels.forEach(panel => panel.resize());
    }

    getCenter(){
        return this.panels.find(panel => panel.center);
    }

    onDidAddPanel(callback){
        return this.emitter.on('did-add-panel', callback);
    }

    onDidRemovePanel(callback){
        return this.emitter.on('did-remove-panel', callback);
    }

    destroy(){
        this.disposables.dispose();
    }
}
