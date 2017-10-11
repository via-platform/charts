const {Disposable, CompositeDisposable, Emitter} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');

module.exports = class ChartCenter {
    constructor(chart){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.chart = chart;
        this.plot = null;
        this.initialized = false;
        this.defaults = null;
        this.margin = {top: 5, right: 40, bottom: 25, left: 0};
        this.layers = [];
        this.initialize();

        this.disposables.add(this.chart.onDidResize(this.resized.bind(this)));
    }

    get element(){
        return this.chart.refs.center;
    }

    get width(){
        return Math.max(0, this.element.clientWidth - this.margin.left - this.margin.right);
    }

    get height(){
        return Math.max(0, this.element.clientHeight - this.margin.top - this.margin.bottom);
    }

    resized(){
        this.scale.x.range([0, this.width]);
        this.scale.y.range([this.height, 0]);

        this.basis.x.range([0, this.width]);
        this.basis.y.range([this.height, 0]);

        this.svg.attr('width', this.width + this.margin.left + this.margin.right);
        this.svg.attr('height', this.height + this.margin.left + this.margin.right);

        this.graphic.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
        this.graphic.select('g.axis.x').attr('transform', `translate(0, ${this.height})`);
        this.graphic.select('g.axis.y').attr('transform', `translate(${this.width}, 0)`);

        this.zoomable.attr('width', this.width).attr('height', this.height);

        this.clip
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.width)
            .attr('height', this.height);

        this.graphic.selectAll('g.grid, g.layers')
            .attr('width', this.width)
            .attr('height', this.height);

        this.emitter.emit('did-resize');
        this.draw();
    }

    initialize(){
        if(this.initialized){
            return;
        }

        this.basis = {
            x: d3.scaleTime().domain([new Date(Date.now() - 864e5), new Date()]),
            y: d3.scaleLinear().domain([3960, 4160]),
            zoom: d3.zoom().on('zoom', this.zoom())
        };

        this.scale = {
            x: this.basis.x.copy(),
            y: this.basis.y.copy()
        };

        this.axis = {
            x: d3.axisBottom(this.scale.x).tickSizeOuter(0),
            y: d3.axisRight(this.scale.y).tickSizeOuter(0)
        };

        this.svg = d3.select(this.element).append('svg');
        this.graphic = this.svg.append('g');
        this.clip = this.graphic.append('clipPath').attr('id', 'clip').append('rect');

        this.graphic.append('g')
            .attr('class', 'grid x')
            .attr('width', this.width)
            .attr('height', this.height);

        this.graphic.append('g')
            .attr('class', 'grid y')
            .attr('width', this.width)
            .attr('height', this.height);

        this.graphic.append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0, ${this.height})`);

        this.graphic.append('g')
                .attr('class', 'y axis')
                .attr('transform', `translate(${this.width}, 0)`)
            .append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -5)
                .attr('y', -15)
                .attr('dy', '.71em')
                .style('text-anchor', 'end')
                .text('Price ($)');

        this.graphic.append('g')
            .attr('class', 'layers')
            .attr('clip-path', 'url(#clip)')
            .attr('width', this.width)
            .attr('height', this.height);

        this.graphic.on('mouseover.chart', this.mouseover());
        this.graphic.on('mousemove.chart', this.mousemove());
        this.graphic.on('mouseout.chart', this.mouseout());

        this.zoomable = this.graphic.append('rect').attr('class', 'zoomable').attr('width', this.width).attr('height', this.height);
        this.zoomable.call(this.basis.zoom);

        this.disposables.add(new Disposable(() => this.graphic.on('.chart', null)));

        this.initialized = true;
        this.emitter.emit('did-initialize');
        this.emitter.emit('did-change-domain', this.scale);
    }

    draw(){
        this.svg.select('g.x.axis').call(this.axis.x);
        this.svg.select('g.y.axis').call(this.axis.y);
        //TODO make the number of ticks into a user preference
        this.svg.select('g.x.grid').call(d3.axisBottom(this.scale.x).ticks(10).tickSize(this.height).tickFormat(''));
        this.svg.select('g.y.grid').call(d3.axisLeft(this.scale.y).ticks(10).tickSize(-this.width).tickFormat(''));
        this.emitter.emit('did-draw');
    }

    addLayer(layer){
        this.layers.push(layer);
        this.layers = _.sortBy(this.layers, 'priority');

        if(layer === _.last(this.layers)){
            this.graphic.select('g.layers').node().appendChild(layer.element);
        }else{
            this.layers[this.layers.indexOf(this.layer) + 1].element.insertBefore(layer.element);
        }

        return new Disposable(() => {
            layer.element.remove();
            this.layers.splice(this.layers.indexOf(layer), 1);
            this.emitter.emit('did-remove-layer', layer)
        });
    }

    zoomTranslateExtent(value){
        if(value){
            this.basis.zoom.translateExtent(value);
            this.graphic.call(this.basis.zoom);
        }else{
            return this.basis.zoom.translateExtent();
        }
    }

    zoom(){
        let that = this;

        return function(d, i){
            that.scale.x.domain(d3.event.transform.rescaleX(that.basis.x).domain());

            // if(!d3.event.sourceEvent.shiftKey){
                that.scale.y.domain(d3.event.transform.rescaleY(that.basis.y).domain());
            // }

            that.emitter.emit('did-zoom', {event: d3.event, mouse: d3.mouse(this), d, i});
            that.emitter.emit('did-change-domain', that.scale);
            that.draw();
        };
    }

    mouseover(){
        let that = this;

        return function(d, i){
            that.emitter.emit('did-mouse-over', {event: d3.event, mouse: d3.mouse(this), d, i});
        };
    }

    mouseout(){
        let that = this;

        return function(d, i){
            that.emitter.emit('did-mouse-out', {event: d3.event, mouse: d3.mouse(this), d, i});
        };
    }

    mousemove(){
        let that = this;

        return function(d, i){
            that.emitter.emit('did-mouse-move', {event: d3.event, mouse: d3.mouse(this), d, i});
        };
    }

    onDidInitialize(callback){
        if(this.initialized){
            callback();
        }

        return this.emitter.on('did-initialize', callback);
    }

    onDidResize(callback){
        return this.emitter.on('did-resize', callback);
    }

    onDidChangeDomain(callback){
        return this.emitter.on('did-change-domain', callback);
    }

    onDidDraw(callback){
        return this.emitter.on('did-draw', callback);
    }

    onDidZoom(callback){
        return this.emitter.on('did-zoom', callback);
    }

    onDidDestroy(callback){
        return this.emitter.on('did-destroy', callback);
    }

    onDidMouseOver(callback){
        return this.emitter.on('did-mouse-over', callback);
    }

    onDidMouseOut(callback){
        return this.emitter.on('did-mouse-out', callback);
    }

    onDidMouseMove(callback){
        return this.emitter.on('did-mouse-move', callback);
    }

    onDidAddLayer(callback){
        return this.emitter.on('did-add-layer', callback);
    }

    onDidRemoveLayer(callback){
        return this.emitter.on('did-remove-layer', callback);
    }

    destroy(){
        this.disposables.dispose();
        this.emitter.dispose();

        this.chart = null;
        this.disposables = null;
        this.emitter = null;
    }
}
