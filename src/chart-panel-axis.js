const {Disposable, CompositeDisposable, Emitter} = require('via');
const d3 = require('d3');
const AXIS_HEIGHT = 22;
const AXIS_WIDTH = 60;
const FLAG_WIDTH = AXIS_WIDTH - 6;
const FLAG_HEIGHT = AXIS_HEIGHT - 3;

//TODO Allow this to be customizable
const TICK_SPACING = 40;

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

        this.disposables.add(this.panel.onDidRescale(this.draw.bind(this)));
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));
        this.disposables.add(this.chart.onDidZoom(this.zoomed.bind(this)));
        this.disposables.add(this.chart.onDidDestroy(this.destroy.bind(this)));

        this.resize();
    }

    flag(){
        const flag = this.svg.append('g').attr('class', 'flag');

        flag.append('rect')
        .attr('x', 1)
        .attr('y', 0)
        .attr('width', AXIS_WIDTH - 1)
        .attr('height', FLAG_HEIGHT);

        flag.append('text')
        .attr('x', AXIS_WIDTH / 2)
        .attr('y', FLAG_HEIGHT / 2 + 1)
        .attr('width', AXIS_WIDTH)
        .attr('height', FLAG_HEIGHT)
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle');

        return flag;
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

    resize(){
        this.svg.attr('height', this.panel.height);
        this.zoomable.attr('height', this.panel.height);
        this.basis.ticks(Math.floor(this.panel.height / TICK_SPACING));

        this.draw();
    }

    draw(){
        this.axis.call(this.basis);
    }

    destroy(){
        this.disposables.dispose();
    }
}
