const {Disposable, CompositeDisposable, Emitter, d3} = require('via');
const _ = require('underscore-plus');
const ChartLayer = require('./chart-layer');
const ChartPanelAxis = require('./chart-panel-axis');
const ChartPanelGrid = require('./chart-panel-grid');
const ChartPanelValues = require('./chart-panel-values');

module.exports = class ChartPanel {
    serialize(){
        return {
            root: this.root,
            layers: this.layers.map(object => object.serialize())
        };
    }

    constructor({chart, root, state, panels}){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();

        this.panels = panels;
        this.chart = chart;
        this.root = root;
        this.layers = [];
        this.locked = true;

        this.width = 0;
        this.height = 0;
        this.padding = 0.05;

        this.basis = d3.scaleLinear().domain([100, 0]);
        this.scale = this.basis.copy();

        this.element = document.createElement('div');
        this.element.classList.add('panel', this.root ? 'center' : 'accessory');

        this.center = document.createElement('div');
        this.center.classList.add('panel-center');

        this.axis = new ChartPanelAxis({chart: this.chart, panel: this});
        this.values = new ChartPanelValues({chart: this.chart, panel: this});

        this.element.appendChild(this.center);
        this.element.appendChild(this.values.element);
        this.element.appendChild(this.axis.element);

        this.svg = d3.select(this.center)
            .append('svg')
            .attr('width', this.width);

        this.grid = new ChartPanelGrid({chart: this.chart, panel: this});

        this.zoomable = this.svg.append('g').attr('class', 'zoomable');
        this.zoomable.call(d3.zoom().on('zoom', this.zoom()));

        this.background = this.zoomable.append('rect').attr('class', 'panel-background');

        this.zoomable
            .on('mouseover', this.mouseover())
            .on('mouseout', this.mouseout())
            .on('mousemove', this.mousemove())
            .on('click', this.click());

        this.disposables.add(this.chart.onDidZoom(this.zoomed.bind(this)));
        this.disposables.add(this.chart.onDidDestroy(this.destroy.bind(this)));
        // this.disposables.add(this.chart.data.onDidUpdateData(this.rescale.bind(this)));
        // this.disposables.add(this.chart.onDidUpdateOffset(this.resize.bind(this)));

        this.disposables.add(via.commands.add(this.element, {
            'charts:remove-panel': () => this.panels.remove(this)
        }));

        if(state && state.layers){
            this.layers = state.layers.map(layer => ChartLayer.deserialize({chart: this.chart, panel: this, state: layer}));
        }

        this.sort();
    }

    sort(){
        this.zoomable.selectAll('.layer').sort();
    }

    add(layer){
        this.layers.push(layer);
        this.emitter.emit('did-add-layer', layer);
        layer.recalculate();
        this.chart.rescale();
        return layer;
    }

    remove(layer){
        layer.destroy();
        this.layers.splice(this.layers.indexOf(layer), 1);
        this.emitter.emit('did-remove-layer', layer);

        if(this.layers.length || this.root){
            return;
        }

        this.panels.remove(this);
    }

    unlock(){
        this.locked = false;
    }

    lock(){
        if(this.locked){
            return;
        }

        this.locked = true;
        this.chart.rescale();
    }

    pan(dy){
        if(this.locked){
            return;
        }

        const [start, end] = this.basis.domain();

        this.basis.domain([this.basis.invert(this.basis(start) - dy), this.basis.invert(this.basis(end) - dy)]);
        this.scale.domain(this.basis.domain());
    }

    zoomed({event, target} = {}){
        if(target !== this){
            d3.zoom().transform(this.zoomable, this.chart.transform);
        }
    }

    zoom(){
        const _this = this;

        return function(d, i){
            if(!_this.locked && d3.event.sourceEvent && d3.event.sourceEvent.movementY){
                _this.pan(d3.event.sourceEvent.movementY);
            }

            _this.chart.zoomed({event: d3.event, target: _this});
        };
    }

    mouseover(){
        const _this = this;

        return function(d, i){
            _this.emitter.emit('did-mouse-over', {event: d3.event, target: _this});
            _this.chart.mouseover({event: d3.event, target: _this});
        };
    }

    mouseout(){
        const _this = this;

        return function(d, i){
            _this.emitter.emit('did-mouse-out', {event: d3.event, target: _this});
            _this.chart.mouseout({event: d3.event, target: _this});
        };
    }

    mousemove(){
        const _this = this;

        return function(d, i){
            _this.emitter.emit('did-mouse-move', {event: d3.event, target: _this});
            _this.chart.mousemove({event: d3.event, target: _this});
        };
    }

    click(){
        const _this = this;

        return function(d, i){
            _this.emitter.emit('did-click', {event: d3.event, target: _this});
            _this.chart.click({event: d3.event, target: _this});
        };
    }

    recalculate(){
        for(const layer of this.layers){
            layer.recalculate();
        }

        this.emitter.emit('did-recalculate', {target: this});
    }

    rescale(){
        if(this.locked){
            const min = [];
            const max = [];

            for(const layer of this.layers){
                const [low, high] = layer.domain;

                if(_.isNumber(low)){
                    min.push(low);
                    max.push(high);
                }
            }

            if(min.length){
                const low = Math.min(...min);
                const high = Math.max(...max);
                const range = high - low;
                const extra = (range > 0) ? range * this.padding : high * this.padding;

                this.basis.domain([high + extra, low - extra]);
                this.scale.domain([high + extra, low - extra]);
            }else{
                this.basis.domain([100, 0]);
                this.scale.domain([100, 0]);
            }
        }

        this.emitter.emit('did-rescale', {target: this});
    }

    resize(){
        this.width = Math.max(this.chart.width - this.chart.offset, 0);
        this.height = this.center.clientHeight;

        this.basis.range([0, this.height]);
        this.scale.range([0, this.height]);

        this.svg.attr('height', this.height).attr('width', this.width);
        this.background.attr('width', this.width).attr('height', this.height);

        if(this.chart.transform){
            d3.zoom().transform(this.zoomable, this.chart.transform);
        }

        this.axis.resize();
        this.grid.resize();
        this.emitter.emit('did-resize', {target: this});
    }

    get decimals(){
        return Math.max(...this.layers.map(layer => layer.decimals), 0);
    }

    get offset(){
        const [low, high] = this.scale.domain();

        //The number of significant digits is now based on the scale, not the layer domains
        return high.toFixed(this.decimals).length * 6 + 12;
    }

    render(){
        this.axis.render();
        this.grid.render();

        for(const layer of this.layers){
            layer.render();
        }

        this.emitter.emit('did-render', {target: this});
    }

    destroy(){
        this.axis.destroy();
        this.grid.destroy();
        this.values.destroy();

        for(const layer of this.layers){
            this.remove(layer);
        }

        this.element.parentElement.removeChild(this.element);
        this.disposables.dispose();
        this.emitter.emit('did-destroy');
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

    onDidClick(callback){
        return this.emitter.on('did-click', callback);
    }

    onDidMouseOver(callback){
        return this.emitter.on('did-mouse-over', callback);
    }

    onDidMouseMove(callback){
        return this.emitter.on('did-mouse-move', callback);
    }

    onDidMouseOut(callback){
        return this.emitter.on('did-mouse-out', callback);
    }

    onDidAddLayer(callback){
        return this.emitter.on('did-add-layer', callback);
    }

    onDidRemoveLayer(callback){
        return this.emitter.on('did-remove-layer', callback);
    }

    onDidRender(callback){
        return this.emitter.on('did-render', callback);
    }
}
