const {Disposable, CompositeDisposable, Emitter, d3} = require('via');
const AXIS_HEIGHT = 22;
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
            .attr('width', this.panel.offset);

        this.zoomable = this.svg.append('rect')
            .attr('class', 'zoomable')
            .attr('width', this.panel.offset);

        this.basis = d3.axisRight(this.panel.scale).tickSizeOuter(0);
        this.axis = this.svg.append('g').attr('class', 'y axis');

        this.zoomable.call(d3.drag().on('drag', this.drag()));
        this.zoomable.on('dblclick', () => this.panel.lock());

        this.disposables.add(this.panel.onDidRescale(this.draw.bind(this)));
        this.disposables.add(this.panel.onDidUpdateOffset(this.resize.bind(this)));
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));
        this.disposables.add(this.chart.onDidDestroy(this.destroy.bind(this)));

        this.resize();
    }

    flag(){
        const flag = this.svg.append('g').attr('class', 'flag');

        flag.append('rect')
        .attr('x', 1)
        .attr('y', 0)
        .attr('width', this.panel.offset - 1)
        .attr('height', FLAG_HEIGHT);

        flag.append('text')
        .attr('x', this.panel.offset / 2)
        .attr('y', FLAG_HEIGHT / 2 + 1)
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'middle');

        return flag;
    }

    range(){
        const range = this.svg.append('g').attr('class', 'range');
        range.append('rect').attr('width', this.panel.offset).attr('x', 1);
        return range;
    }

    drag(){
        const _this = this;

        return function(d, i){
            _this.panel.unlock();

            const [start, end] = _this.panel.basis.domain();
            const dy = d3.event.dy;

            _this.panel.basis.domain([_this.panel.basis.invert(_this.panel.basis(start) - dy), _this.panel.basis.invert(_this.panel.basis(end) + dy)]);
            _this.panel.scale.domain(_this.panel.basis.domain());
            _this.panel.rescale();
        };
    }

    resize(){
        this.svg.attr('height', this.panel.height);
        this.zoomable.attr('height', this.panel.height);
        this.basis.ticks(Math.floor(this.panel.height / TICK_SPACING));

        this.svg.selectAll('g.flag rect').attr('width', this.panel.offset);
        this.svg.selectAll('g.flag text').attr('x', this.panel.offset / 2);
        this.svg.attr('width', this.panel.offset);
        this.zoomable.attr('width', this.panel.offset);

        this.draw();
    }

    draw(){
        this.axis.call(this.basis);
    }

    destroy(){
        this.disposables.dispose();
    }
}
