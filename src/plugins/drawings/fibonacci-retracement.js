const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const moment = require('moment');
const etch = require('etch');
const $ = etch.dom;

const AXIS_HEIGHT = 22;
const FLAG_HEIGHT = AXIS_HEIGHT - 3;
const X_FLAG_WIDTH = 114;
const FibonacciLevels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618, 3.618, 4.236];

class FibonacciRetracement {
    constructor({chart, element, panel, layer, params}){
        this.disposables = new CompositeDisposable();
        this.working = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.layer = layer;
        this.start = {x: this.chart.scale.invert(event.offsetX), y: this.panel.scale.invert(event.offsetY)};
        this.end = _.clone(this.start);
        this.done = false;

        this.element = element;
        this.element.classed('fibonacci-retracement', true);

        this.background = this.element.append('rect').attr('x', 0).attr('y', 0).attr('class', 'background');
        this.direction = this.element.append('path').attr('class', 'direction');
        this.boxes = this.element.append('g').attr('class', 'boxes');
        this.lines = this.element.append('g').attr('class', 'lines');
        this.labels = this.element.append('g').attr('class', 'labels');

        this.working.add(this.chart.onDidClick(this.click.bind(this)));
        this.working.add(this.chart.onDidMouseMove(this.mousemove.bind(this)));
        this.working.add(this.chart.onDidZoom(this.draw.bind(this)));
        this.working.add(this.chart.onDidCancel(() => this.panel.removeLayer(this.layer)));
        this.working.add(new Disposable(() => this.background.remove()));

        this.range = {
            x: this.chart.axis.range(),
            y: this.panel.axis.range()
        };

        this.flag = {
            start: {
                x: this.chart.axis.flag(),
                y: this.panel.axis.flag()
            },
            end: {
                x: this.chart.axis.flag(),
                y: this.panel.axis.flag()
            }
        };

        this.handle = {
            start: this.element.append('circle').attr('r', 5).classed('handle', true),
            end: this.element.append('circle').attr('r', 5).classed('handle', true)
        };

        this.range.x.classed('fibonacci-retracement-range', true);
        this.range.y.classed('fibonacci-retracement-range', true);
        this.flag.start.x.classed('fibonacci-retracement-flag', true);
        this.flag.start.y.classed('fibonacci-retracement-flag', true);
        this.flag.end.x.classed('fibonacci-retracement-flag', true);
        this.flag.end.y.classed('fibonacci-retracement-flag', true);

        this.disposables.add(new Disposable(() => {
            this.range.x.remove();
            this.range.y.remove();
            this.flag.start.x.remove();
            this.flag.start.y.remove();
            this.flag.end.x.remove();
            this.flag.end.y.remove();
        }));

        this.disposables.add(this.panel.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));

        this.resize();
    }

    resize(){
        if(!this.done){
            this.background.attr('width', this.panel.width).attr('height', this.panel.height);
        }

        this.draw();
    }

    serialize(){
        return {};
    }

    mousemove({event, target}){
        if(target !== this.panel) return;

        this.end = {x: this.chart.scale.invert(event.offsetX), y: this.panel.scale.invert(event.offsetY)};
        this.draw();
    }

    click({event, target}){
        if(target !== this.panel) return;

        this.end = {x: this.chart.scale.invert(event.offsetX), y: this.panel.scale.invert(event.offsetY)};
        this.working.dispose();
        this.working = null;
        this.done = true;
        this.chart.done();
        this.element.on('click', this.select());
        this.draw();
    }

    select(){
        const _this = this;

        return function(d, i){
            if(d3.event.shiftKey) return;

            d3.event.stopPropagation();
            _this.chart.select(_this.layer);
        };
    }

    draw(){
        const sd = new Date(Math.round(this.start.x.getTime() / this.chart.granularity) * this.chart.granularity);
        const ed = new Date(Math.round(this.end.x.getTime() / this.chart.granularity) * this.chart.granularity);

        const sx = this.chart.scale(sd);
        const ex = this.chart.scale(ed);

        const sy = this.panel.scale(this.start.y);
        const ey = this.panel.scale(this.end.y);

        const sv = this.start.y.toFixed(this.chart.precision);
        const ev = this.end.y.toFixed(this.chart.precision);

        const start = {
            x: Math.min(sx, ex),
            y: Math.min(sy, ey)
        };

        const end = {
            x: Math.max(sx, ex),
            y: Math.max(sy, ey)
        };

        const selected = this.layer.isSelected();
        const hidden = !selected;
        const difference = end.y - start.y;

        const boxes = this.boxes.selectAll('rect').data(FibonacciLevels.slice(1));

        boxes.enter()
                .append('rect')
            .merge(boxes)
                .attr('x', start.x)
                .attr('y', (d, i) => start.y + FibonacciLevels[i] * difference)
                .attr('width', end.x - start.x)
                .attr('height', (d, i) => (d - FibonacciLevels[i]) * difference);

        const lines = this.lines.selectAll('path').data(FibonacciLevels);

        lines.enter()
                .append('path')
            .merge(lines)
                .attr('d', (d, i) => `M ${start.x} ${Math.floor(start.y + FibonacciLevels[i] * difference) - 0.5} h ${end.x - start.x}`);

        const labels = this.labels.selectAll('text').data(FibonacciLevels);

        labels.enter()
                .append('text')
            .merge(labels)
                .attr('alignment-baseline', 'middle')
                .attr('text-anchor', 'end')
                .attr('x', start.x - 5)
                .attr('y', (d, i) => Math.floor(start.y + FibonacciLevels[i] * difference))
                .text(d => `${d} (${this.panel.scale.invert(start.y + d * difference).toFixed(this.chart.precision)})`)

        this.direction.attr('d', `M ${sx} ${sy} L ${ex} ${ey}`)
        this.element.classed('selected', selected);
        this.range.x.classed('hidden', hidden);
        this.range.y.classed('hidden', hidden);
        this.flag.start.x.classed('hidden', hidden);
        this.flag.start.y.classed('hidden', hidden);
        this.flag.end.x.classed('hidden', hidden);
        this.flag.end.y.classed('hidden', hidden);

        this.range.x.select('rect')
            .attr('x', start.x)
            .attr('width', end.x - start.x);

        this.range.y.select('rect')
            .attr('y', start.y)
            .attr('height', end.y - start.y);

        this.flag.start.x.attr('transform', `translate(${start.x}, 0)`).select('text').text(moment(sd).format('YYYY-MM-DD HH:mm:ss'));
        this.flag.end.x.attr('transform', `translate(${end.x - X_FLAG_WIDTH}, 0)`).select('text').text(moment(ed).format('YYYY-MM-DD HH:mm:ss'));

        this.flag.start.y.attr('transform', `translate(0, ${sy})`).select('text').text(sv);
        this.flag.end.y.attr('transform', `translate(0, ${ey - FLAG_HEIGHT})`).select('text').text(ev);

        this.handle.start.attr('cx', sx).attr('cy', sy);
        this.handle.end.attr('cx', ex).attr('cy', ey);
    }

    destroy(){
        if(this.working) this.working.dispose();
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'fibonacci-retracement',
    type: 'drawing',
    settings: {},
    title: 'Fibonacci Retracement',
    description: 'Draw a Fibonacci Retracement on the chart.',
    selectable: true,
    instance: params => new FibonacciRetracement(params)
};
