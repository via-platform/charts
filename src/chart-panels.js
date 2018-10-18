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
        this.offset = 0;
        this.offsets = new Map();

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
            for(let panel of state){
                this.panels.push(new ChartPanel({chart: this.chart, panels: this, state: panel}));
            }
        }else{
            this.panels.push(new ChartPanel({chart: this.chart, panels: this, center: true}));
        }

        for(let panel of this.panels){
            this.element.appendChild(panel.element);
        }
    }

    create(){
        const panel = new ChartPanel({chart: this.chart, panels: this});
        this.panels.push(panel);
        this.offsets.set(panel, panel.offset);
        this.element.appendChild(panel.element);
        this.emitter.emit('did-add-panel', panel);
        this.resize();

        return panel;
    }

    addPanel(plugin){
        const panel = new ChartPanel({chart: this.chart, panels: this, plugin});
        this.panels.push(panel);
        this.offsets.set(panel, panel.offset);
        this.element.appendChild(panel.element);
        this.emitter.emit('did-add-panel', panel);
        this.resize();
    }

    removePanel(panel){
        this.panels.splice(this.panels.indexOf(panel), 1);
        this.offsets.delete(panel);
        this.emitter.emit('did-remove-panel', panel);
        panel.destroy();
        this.resize();
    }

    didUpdateOffset(panel, offset){
        this.offsets.set(panel, offset);

        const max = Math.max(50, d3.max(Array.from(this.offsets.values())));

        if(max !== this.offset){
            this.offset = max;
            this.emitter.emit('did-update-offset', this.offset);
        }
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

    onDidUpdateOffset(callback){
        return this.emitter.on('did-update-offset', callback);
    }

    destroy(){
        this.offsets.clear();
        this.disposables.dispose();
    }
}
