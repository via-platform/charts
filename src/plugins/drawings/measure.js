const {CompositeDisposable, Disposable} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;
const AXIS_HEIGHT = 22;
const FLAG_HEIGHT = AXIS_HEIGHT - 3;

class Measure {
    constructor({chart, element, panel, layer, params}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.layer = layer;
        this.start = {x: this.chart.scale.invert(event.offsetX), y: this.panel.scale.invert(event.offsetY)};
        this.end = _.clone(this.start);
        this.done = false;

        this.element = element;
        this.element.classed('measure', true);

        this.background = this.element.append('rect').attr('x', 0).attr('y', 0).attr('class', 'background');
        this.rect = this.element.append('rect').attr('class', 'selection');

        this.text = this.element.append('text')
            .attr('alignment-baseline', 'hanging')
            .attr('text-anchor', 'middle');

        this.disposables.add(this.chart.onDidClick(this.click.bind(this)));
        this.disposables.add(this.chart.onDidMouseMove(this.mousemove.bind(this)));
        this.disposables.add(this.chart.onDidZoom(this.draw.bind(this)));
        this.disposables.add(this.chart.onDidCancel(() => this.panel.removeLayer(this.layer)));

        this.range = {
            x: this.chart.axis.range(),
            y: this.panel.axis.range()
        };

        this.range.x.classed('measure-range', true);
        this.range.y.classed('measure-range', true);

        this.disposables.add(new Disposable(() => {
            this.range.x.remove();
            this.range.y.remove();
        }));

        this.disposables.add(this.panel.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));

        this.resize();
    }

    resize(){
        this.background.attr('width', this.panel.width).attr('height', this.panel.height);
        this.draw();
    }

    serialize(){
        return {};
    }

    mousemove({event, target}){
        if(target !== this.panel) return;
        if(this.done) return;

        this.end = {x: this.chart.scale.invert(event.offsetX), y: this.panel.scale.invert(event.offsetY)};
        this.draw();
    }

    click({event, target}){
        //Self-destruct once the user clicks again, regardless of where the user clicks on the chart
        if(this.done) return this.panel.removeLayer(this.layer);
        if(target !== this.panel) return;

        this.end = {x: this.chart.scale.invert(event.offsetX), y: this.panel.scale.invert(event.offsetY)};
        this.done = true;
        this.draw();
    }

    draw(){
        const sd = new Date(Math.round(this.start.x.getTime() / this.chart.granularity) * this.chart.granularity);
        const ed = new Date(Math.round(this.end.x.getTime() / this.chart.granularity) * this.chart.granularity);

        const sx = this.chart.scale(sd);
        const ex = this.chart.scale(ed);

        const sy = this.panel.scale(this.start.y);
        const ey = this.panel.scale(this.end.y);

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
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'measure',
    type: 'drawing',
    settings: {},
    title: 'Measure',
    description: 'Measure an area on the chart.',
    selectable: true,
    instance: params => new Measure(params)
};
