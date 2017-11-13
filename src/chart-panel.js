const {Disposable, CompositeDisposable, Emitter} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');
const ChartLayer = require('./chart-layer');
const ChartPanelAxis = require('./chart-panel-axis');
const ChartPanelGrid = require('./chart-panel-grid');

//TODO allow the user to set a preference on this
const AXIS_WIDTH = 60;

module.exports = class ChartPanel {

    serialize(){
        return {
            isCenter: this.isCenter,
            layers: this.layers.map(object => object.serialize())
        };
    }

    constructor({chart, isCenter, state, plugin}){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();

        this.chart = chart;
        this.isCenter = isCenter;
        this.layers = [];

        this.width = 0;
        this.height = 0;

        this.basis = d3.scaleLinear().domain([100, 0]);
        this.scale = this.basis.copy();

        this.element = document.createElement('div');
        this.element.classList.add('panel', this.isCenter ? 'center' : 'indicator');

        this.center = document.createElement('div');
        this.center.classList.add('panel-center');

        this.axis = new ChartPanelAxis({chart: this.chart, panel: this});
        this.element.appendChild(this.center);
        this.element.appendChild(this.axis.element);

        this.svg = d3.select(this.center)
            .append('svg')
            .attr('width', this.width);

        this.zoomable = this.svg.append('rect').attr('class', 'zoomable');
        this.zoomable.call(d3.zoom().on('zoom', this.zoom()));

        this.grid = new ChartPanelGrid({chart: this.chart, panel: this});

        this.disposables.add(this.chart.onDidZoom(this.zoomed.bind(this)));
        this.disposables.add(this.chart.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.chart.data.onDidUpdateData(this.rescale.bind(this)));

        if(state && state.layers){
            this.layers = state.layers.map(layer => ChartLayer.deserialize({chart: this.chart, panel: this, state: layer}));
        }else{
            this.layers.push(new ChartLayer({chart: this.chart, panel: this, isRoot: true, plugin}));
        }

        this.resize();
        this.rescale();
    }

    addLayer(plugin){
        let layer = new ChartLayer({chart: this.chart, panel: this, plugin});
        this.layers.push(layer);
        this.emitter.emit('did-add-layer', layer);
        this.draw();
    }

    getRoot(){
        return this.layers.find(layer => layer.isRoot);
    }

    resize(){
        this.width = this.center.clientWidth;
        this.height = this.center.clientHeight;
        this.basis.range([0, this.height]);
        this.scale.range([0, this.height]);

        this.svg.attr('height', this.height).attr('width', this.width);
        this.zoomable.attr('width', this.width).attr('height', this.height);

        this.emitter.emit('did-resize', {width: this.width, height: this.height});

        this.draw();
    }

    draw(){
        this.layers.forEach(layer => layer.draw());
    }

    zoomed({event, target}){
        if(target !== this){
            d3.zoom().transform(this.zoomable, event.transform);
        }

        this.rescale();
    }

    zoom(){
        const _this = this;

        return function(d, i){
            _this.chart.zoomed({event: d3.event, target: _this});
        };
    }

    rescale(){
        let domains = _.flatten(this.layers.map(layer => layer.domain()));

        if(domains.length){
            let min = _.min(domains);
            let max = _.max(domains);

            if(!_.isUndefined(min) && !_.isUndefined(max)){
                this.basis.domain([max, min]).nice();
                this.scale.domain([max, min]).nice();
                this.emitter.emit('did-rescale', this.scale);
            }
        }else{
            this.basis.domain([100, 0]);
            this.scale.domain([100, 0]);
            this.emitter.emit('did-rescale', this.scale);
        }

        this.draw();
    }

    destroy(){
        this.disposables.dispose();
        this.emitter.emit('did-destroy');
    }

    onDidDraw(callback){
        return this.emitter.on('did-draw', callback);
    }

    onDidResize(callback){
        return this.emitter.on('did-resize', callback);
    }

    onDidRescale(callback){
        return this.emitter.on('did-rescale', callback);
    }

    onDidDestroy(callback){
        return this.emitter.on('did-destroy', callback);
    }
}
