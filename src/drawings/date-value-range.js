const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;
const moment = require('moment');

const AXIS_HEIGHT = 22;
const FLAG_HEIGHT = AXIS_HEIGHT - 3;
const X_FLAG_WIDTH = 114;

class DateValueRange {
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
        this.element.classed('date-value-range', true);

        this.background = this.element.append('rect').attr('x', 0).attr('y', 0).attr('class', 'background');
        this.rect = this.element.append('rect').attr('class', 'selection');

        this.text = this.element.append('text')
            .attr('alignment-baseline', 'hanging')
            .attr('text-anchor', 'middle');

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

        this.range.x.classed('date-value-range', true);
        this.range.y.classed('date-value-range', true);
        this.flag.start.x.classed('date-value-flag', true);
        this.flag.start.y.classed('date-value-flag', true);
        this.flag.end.x.classed('date-value-flag', true);
        this.flag.end.y.classed('date-value-flag', true);

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

        const value = (this.end.y - this.start.y).toFixed(this.chart.precision);
        const percentage = ((this.end.y - this.start.y) / this.start.y * 100).toFixed(2);
        const bars = (ed.getTime() - sd.getTime()) / this.chart.granularity;
        const duration = moment.duration(ed.getTime() - sd.getTime(), 'milliseconds').format('d[d], h[h], m[m], s[s]', {largest: 2, trim: 'both'});
        const selected = this.layer.isSelected();
        const hidden = !selected;

        this.element.classed('selected', selected);
        this.range.x.classed('hidden', hidden);
        this.range.y.classed('hidden', hidden);
        this.flag.start.x.classed('hidden', hidden);
        this.flag.start.y.classed('hidden', hidden);
        this.flag.end.x.classed('hidden', hidden);
        this.flag.end.y.classed('hidden', hidden);

        this.rect.attr('x', start.x)
            .attr('y', start.y)
            .attr('width', end.x - start.x)
            .attr('height', end.y - start.y);

        this.range.x.select('rect')
            .attr('x', start.x)
            .attr('width', end.x - start.x);

        this.range.y.select('rect')
            .attr('y', start.y)
            .attr('height', end.y - start.y);

        this.text.attr('x', (end.x + start.x) / 2)
            .attr('y', end.y + 6)
            .text(`${value} (${percentage}%), ${duration} (${bars} Bars)`);

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
    name: 'date-value-range',
    type: 'drawing',
    settings: {},
    title: 'Date & Value Range',
    description: 'Draw a date and value range.',
    selectable: true,
    instance: params => new DateValueRange(params)
};
