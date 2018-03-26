const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class Circle {
    constructor({chart, element, panel, layer, params}){
        this.disposables = new CompositeDisposable();
        this.working = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.layer = layer;
        this.start = {x: this.chart.scale.invert(event.offsetX), y: this.panel.scale.invert(event.offsetY)};
        this.end = _.clone(this.start);
        this.chart.select(this.layer);
        this.radius = 0;
        this.done = false;

        this.element = element;
        this.element.classed('circle', true);

        this.background = this.element.append('rect').attr('x', 0).attr('y', 0).attr('class', 'background');
        this.circle = this.element.append('circle').attr('class', 'selection');

        this.working.add(this.chart.onDidClick(this.click.bind(this)));
        this.working.add(this.chart.onDidMouseMove(this.mousemove.bind(this)));
        this.working.add(this.chart.onDidZoom(this.draw.bind(this)));
        this.working.add(this.chart.onDidCancel(() => this.panel.removeLayer(this.layer)));
        this.working.add(new Disposable(() => this.background.remove()));

        this.handle = {
            top: this.element.append('circle').attr('r', 5).classed('handle', true),
            right: this.element.append('circle').attr('r', 5).classed('handle', true),
            bottom: this.element.append('circle').attr('r', 5).classed('handle', true),
            left: this.element.append('circle').attr('r', 5).classed('handle', true),
            center: this.element.append('circle').attr('r', 5).classed('handle', true)
        };

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
        this.done = true;
        this.element.on('click', this.select());
        this.chart.select(this.layer);
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
            .text(`${value} (${percentage}%), ${bars} Bars`);

        this.flag.start.x.attr('transform', `translate(${start.x}, 0)`).select('text').text(moment(sd).format('YYYY-MM-DD HH:mm:ss'));
        this.flag.end.x.attr('transform', `translate(${end.x - X_FLAG_WIDTH}, 0)`).select('text').text(moment(ed).format('YYYY-MM-DD HH:mm:ss'));

        this.flag.start.y.attr('transform', `translate(0, ${sy})`).select('text').text(sv);
        this.flag.end.y.attr('transform', `translate(0, ${ey - FLAG_HEIGHT})`).select('text').text(ev);

        this.handle.start.attr('cx', sx).attr('cy', sy);
        this.handle.end.attr('cx', ex).attr('cy', ey);
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'circle',
    type: 'drawing',
    settings: {},
    title: 'Circle',
    description: 'Draw a circle on the chart.',
    selectable: true,
    instance: params => new Circle(params)
};
