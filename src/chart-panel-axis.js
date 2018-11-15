const {Disposable, CompositeDisposable, Emitter} = require('event-kit');
const d3 = require('d3');
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
            .attr('width', this.chart.offset);

        this.zoomable = this.svg.append('rect')
            .attr('class', 'zoomable')
            .attr('width', this.chart.offset);

        this.basis = d3.axisRight(this.panel.scale).tickSizeOuter(0);
        this.axis = this.svg.append('g').attr('class', 'y axis');

        this.zoomable.call(d3.drag().on('drag', this.drag()));
        this.zoomable.on('dblclick', () => this.panel.lock());
    }

    flag(){
        const flag = this.svg.append('g').attr('class', 'flag');

        flag.append('rect')
            .attr('x', 1)
            .attr('y', 0)
            .attr('width', this.chart.offset - 1)
            .attr('height', FLAG_HEIGHT);

        flag.append('text')
            .attr('x', this.chart.offset / 2)
            .attr('y', FLAG_HEIGHT / 2 + 1)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle');

        return flag;
    }

    range(){
        const range = this.svg.append('g').attr('class', 'range');
        range.append('rect').attr('width', this.chart.offset).attr('x', 1);
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

            //We rescale the chart because it's possible that we've entered into a new level of decimal precision
            //by dragging this axes. The axis may be wider or narrower to accomodate.
            _this.chart.rescale();
        };
    }

    resize(){
        this.svg.attr('height', this.panel.height);
        this.zoomable.attr('height', this.panel.height);
        this.basis.ticks(Math.floor(this.panel.height / TICK_SPACING));

        this.svg.selectAll('g.flag rect').attr('width', this.chart.offset);
        this.svg.selectAll('g.flag text').attr('x', this.chart.offset / 2);
        this.svg.attr('width', this.chart.offset);
        this.zoomable.attr('width', this.chart.offset);
    }

    render(){
        this.axis.call(this.basis.tickFormat(d3.format(`,.${this.panel.decimals}f`)));
        this.axis.selectAll('.tick').attr('transform', d => `translate(0, ${Math.round(this.panel.scale(d)) + 0.5})`);
    }

    destroy(){
        this.disposables.dispose();
    }
}
