const {Disposable, CompositeDisposable, Emitter} = require('via');
const d3 = require('d3');
const AXIS_HEIGHT = 30;


module.exports = class ChartAxis {
    constructor({chart}){
        this.chart = chart;
        this.disposables = new CompositeDisposable();

        this.element = document.createElement('div');
        this.element.classList.add('chart-axis', 'x');

        this.svg = d3.select(this.element)
            .append('svg')
            .attr('height', AXIS_HEIGHT);

        this.zoomable = this.svg.append('rect')
            .attr('class', 'zoomable')
            .attr('height', AXIS_HEIGHT);

        this.basis = d3.axisBottom(this.chart.scale).tickSizeOuter(0);
        this.axis = this.svg.append('g').attr('class', 'x axis');

        this.zoomable.call(d3.zoom().on('zoom', this.zoom()));
        this.disposables.add(this.chart.onDidResize(this.resize.bind(this)));
        this.disposables.add(this.chart.onDidZoom(this.zoomed.bind(this)));

        this.resize({width: 0});
    }

    zoom(){
        const _this = this;

        return function(d, i){
            _this.chart.zoomed({event: d3.event, target: _this});
        };
    }

    zoomed({event, target}){
        if(target !== this){
            d3.zoom().transform(this.zoomable, event.transform);
        }

        this.draw();
    }

    draw(){
        this.axis.call(this.basis);
    }

    resize({width}){
        this.svg.attr('width', width);
        this.zoomable.attr('width', width);

        this.draw();
    }

    destroy(){
        this.disposables.dispose();
    }
}
