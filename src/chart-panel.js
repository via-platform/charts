const {Disposable, CompositeDisposable, Emitter, d3} = require('via');
const _ = require('underscore-plus');
const ChartLayer = require('./chart-layer');
const ChartPanelAxis = require('./chart-panel-axis');
const ChartPanelGrid = require('./chart-panel-grid');
const ChartPanelValues = require('./chart-panel-values');

module.exports = class ChartPanel {
    serialize(){
        return {
            center: this.center,
            layers: this.layers.map(object => object.serialize())
        };
    }

    constructor({chart, center, state, panels}){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();

        this.panels = panels;
        this.chart = chart;
        this.center = center;
        this.layers = [];
        this.locked = true;

        this.width = 0;
        this.height = 0;
        this.padding = 0.05;

        this.basis = d3.scaleLinear().domain([100, 0]);
        this.scale = this.basis.copy();

        this.element = document.createElement('div');
        this.element.classList.add('panel', this.center ? 'center' : 'accessory');

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
            'charts:remove-panel': () => this.remove()
        }));

        if(state && state.layers){
            this.layers = state.layers.map(layer => ChartLayer.deserialize({chart: this.chart, panel: this, state: layer}));
        }else{
            // this.layers.push(new ChartLayer({chart: this.chart, panel: this, plugin}));
        }

        this.sortLayers();
    }

    addLayer(plugin, params){
        const layer = new ChartLayer({chart: this.chart, panel: this, plugin, params});
        this.layers.push(layer);
        this.emitter.emit('did-add-layer', layer);

        return layer;
    }

    removeLayer(layer){
        _.remove(this.layers, layer);
        this.emitter.emit('did-remove-layer', layer);
        layer.destroy();

        if(!this.layers.length && !this.center){
            this.remove();
        }
    }

    sortLayers(){
        this.zoomable.selectAll('.layer').sort();
    }

    didModifyLayer(layer){
        this.emitter.emit('did-modify-layer', layer);
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
        this.background.attr('width', this.width).attr('height', this.height);

        if(this.chart.transform){
            d3.zoom().transform(this.zoomable, this.chart.transform);
        }

        this.axis.resize();
        this.grid.resize();
    }

    add(layer){
        this.layers.push(layer);
        this.emitter.emit('did-add-layer', layer);
        this.chart.rescale();
    }

    remove(layer){
        layer.destroy();

        _.remove(this.layers, layer);
        this.emitter.emit('did-remove-layer');
        this.chart.rescale();
    }

    unlock(){
        this.locked = false;
    }

    lock(){
        if(this.locked) return;

        this.locked = true;
        // this.rescale();
    }

    pan(dy){
        if(this.locked){
            return;
        }

        const [start, end] = this.basis.domain();

        this.basis.domain([this.basis.invert(this.basis(start) - dy), this.basis.invert(this.basis(end) - dy)]);
        this.scale.domain(this.basis.domain());
        // this.rescale();
    }

    zoomed({event, target} = {}){
        if(target !== this){
            d3.zoom().transform(this.zoomable, this.chart.transform);
        }

        // this.rescale();
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
    }

    rescale(domain){
        for(const layer of this.layers){
            layer.rescale();
        }

        if(this.locked){
            console.log(this.layers.map(layer => layer.domain))
            // const domains = ;

            const domains = [];//_.flatten(this.layers.filter(layer => (layer instanceof ChartLayer)).map(layer => layer.domain())).filter(domain => !_.isUndefined(domain));

            if(domains.length){
                const min = _.min(domains);
                const max = _.max(domains);
                const range = max - min;
                const extra = range * this.padding;

                if(!_.isUndefined(min) && !_.isUndefined(max)){
                    this.basis.domain([max + extra, min - extra]);
                    this.scale.domain([max + extra, min - extra]);
                    this.emitter.emit('did-rescale', this.scale);
                }
            }else{
                this.basis.domain([100, 0]);
                this.scale.domain([100, 0]);
                this.emitter.emit('did-rescale', this.scale);
            }
        }else{

            //Apply the transformation to the domain instead
            this.emitter.emit('did-rescale', this.scale);
        }
    }

    get decimals(){
        return Math.max(...this.layers.map(layer => layer.decimals));
    }

    get offset(){
        //The number of significant digits is now based on the scale, not the layer domains
        return this.scale.domain()[1].toFixed(this.decimals).length * 6 + 12;
    }

    removePanel(){
        if(this.center){
            return;
        }

        this.chart.panels.removePanel(this);
    }

    render(){
        this.axis.render();
        this.grid.render();

        this.layers.forEach(layer => layer.render());
    }

    destroy(){
        this.axis.destroy();
        this.values.destroy();
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

    onDidModifyLayer(callback){
        return this.emitter.on('did-modify-layer', callback);
    }
}
