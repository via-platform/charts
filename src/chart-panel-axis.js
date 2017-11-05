const {Disposable, CompositeDisposable, Emitter} = require('via');
const d3 = require('d3');
const AXIS_WIDTH = 60;

module.exports = class ChartPanelAxis {
    constructor({chart, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;

        this.element = document.createElement('div');
        this.element.classList.add('chart-axis', 'y');

        this.svg = d3.select(this.element)
            .append('svg')
            .attr('width', AXIS_WIDTH);

        this.zoomable = this.svg.append('rect')
            .attr('class', 'zoomable')
            .attr('width', AXIS_WIDTH);

        this.basis = d3.axisRight(this.panel.scale).tickSizeOuter(0);
        this.axis = this.svg.append('g').attr('class', 'y axis');

        this.zoomable.call(d3.zoom().on('zoom', this.zoom()));
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));
        this.disposables.add(this.chart.onDidZoom(this.zoomed.bind(this)));

        this.resize({height: 0});
    }

    zoom(){
        const _this = this;

        return function(d, i){
            // _this.chart.zoomed({event: d3.event, target: _this});
        };
    }

    zoomed({event, target}){
        if(target !== this){
            // d3.zoom().transform(this.zoomable, event.transform);
        }

        // this.draw();
    }

    resize({height}){
        this.svg.attr('height', height);
        this.zoomable.attr('height', height);

        this.draw();
    }

    draw(){
        this.axis.call(this.basis);
    }
}
