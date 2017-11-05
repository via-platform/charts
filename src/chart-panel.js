const {Disposable, CompositeDisposable, Emitter} = require('via');
const d3 = require('d3');
const ChartLayer = require('./chart-layer');
const ChartPanelAxis = require('./chart-panel-axis');
const ChartPanelGrid = require('./chart-panel-grid');

//TODO allow the user to set a preference on this
const DEFAULT_PLOT = 'candlestick';
const AXIS_WIDTH = 60;

module.exports = class ChartPanel {

    serialize(){
        return {
            isCenter: this.isCenter,
            plot: this.plot.serialize(),
            objects: this.objects.map(object => object.serialize())
        };
    }

    constructor({chart, isCenter, plot, state}){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();

        this.chart = chart;
        this.isCenter = isCenter;
        this.objects = [];

        this.width = 0;
        this.height = 0;

        this.basis = d3.scaleLinear().domain([0, 100]);
        this.scale = this.basis.copy();

        this.element = document.createElement('div');
        this.element.classList.add('panel', this.isCenter ? 'center' : 'indicator');

        this.layers = document.createElement('div');
        this.layers.classList.add('panel-layers');

        this.grid = new ChartPanelGrid({chart: this.chart, panel: this});
        this.axis = new ChartPanelAxis({chart: this.chart, panel: this});

        this.element.appendChild(this.layers);
        this.element.appendChild(this.axis.element);

        this.svg = d3.select(this.layers)
            .append('svg')
            .attr('width', this.width);

        this.zoomable = this.svg.append('rect').attr('class', 'zoomable');
        this.zoomable.call(d3.zoom().on('zoom', this.zoom()));
        // this.zoomable.call(d3.drag().on('drag', this.drag()));

        this.disposables.add(this.chart.onDidDraw(this.draw.bind(this)));
        this.disposables.add(this.chart.onDidZoom(this.zoomed.bind(this)));
        this.disposables.add(this.chart.onDidDestroy(this.destroy.bind(this)));

        this.resize();
    }

    initialize(state = {}){
        // this.layers = this.svg.append('rect').attr('class', 'layers');

        // this.grid.x = this.svg.append('g').attr('class', 'grid x');
        // this.grid.y = this.svg.append('g').attr('class', 'grid y');


        // let plugin = state.plot.plugin || DEFAULT_PLOT;
        // let layer = svg.append('g').attr('class', 'plot layer');
        // this.plot = this.chart.plugins.get(plugin).instance({chart, panel: this, state: state.plot, layer});

        if(state.objects){
            for(let object of state.objects){

            }
        }
    }

    resize(){
        this.width = this.layers.clientWidth;
        this.height = this.layers.clientHeight;
        this.basis.range([0, this.height]);
        this.scale.range([0, this.height]);

        this.svg.attr('height', this.height).attr('width', this.width);
        this.zoomable.attr('width', this.width).attr('height', this.height);

        this.emitter.emit('did-resize', {width: this.width, height: this.height});

        this.draw();
    }

    draw(){
        //Calculate the range of this graph

        //Scale the x and y axes appropriately
        // this.element.select('g.y.axis').call(this.axis.y);
        // this.element.select('g.x.grid').call(d3.axisBottom(this.scale.x).ticks(10).tickSize(this.height).tickFormat(''));
        // this.element.select('g.y.grid').call(d3.axisLeft(this.scale.y).ticks(10).tickSize(-this.width).tickFormat(''));

        // this.emitter.emit('did-draw');
    }

    drag(){
        const _this = this;

        return function(d, i){
            // console.log('dragged');
            // console.log(d3.event.transform);
            // _this.chart.zoomed({event: d3.event, target: _this});
        };
    }

    zoomed({event, target}){
        if(target !== this){
            d3.zoom().transform(this.zoomable, event.transform);
        }

        this.draw();
    }

    zoom(){
        const _this = this;

        return function(d, i){
            _this.chart.zoomed({event: d3.event, target: _this});
        };
    }

    updateDomain(){
        let domains = _.flatten(this.layers.map(layer => layer.domain())).filter(value => !_.isUndefined(value));

        if(domains.length){
            let min = _.min(domains);
            let max = _.max(domains);

            if(!_.isUndefined(min) && !_.isUndefined(max)){
                // console.log(`Min ${min} and Max ${max}`);
                this.basis.y.domain([min, max]);
                this.scale.y.domain([min, max]);
                this.emitter.emit('did-change-domain', this.scale);
                this.draw();
            }
        }else{
            this.basis.y.domain([0, 100]);
            this.scale.y.domain([0, 100]);
            this.emitter.emit('did-change-domain', this.scale);
            this.draw();
        }
    }

    changePlotType(type){
        if(this.plot !== type){
            this.emitter.emit('did-change-plot-type');
        }
    }

    onDidDraw(callback){
        return this.emitter.on('did-draw', callback);
    }

    onDidResize(callback){
        return this.emitter.on('did-resize', callback);
    }

    destroy(){
        this.disposables.dispose();
    }
}
