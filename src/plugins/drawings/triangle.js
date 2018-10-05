const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const moment = require('moment');
const etch = require('etch');
const $ = etch.dom;

const AXIS_HEIGHT = 22;
const FLAG_HEIGHT = AXIS_HEIGHT - 3;
const X_FLAG_WIDTH = 114;

class Triangle {
    constructor({chart, element, panel, layer, params}){
        this.disposables = new CompositeDisposable();
        this.working = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.layer = layer;

        this.start = {x: this.chart.scale.invert(event.offsetX), y: this.panel.scale.invert(event.offsetY)};
        this.middle = _.clone(this.start);
        this.end = null;

        this.done = false;

        this.element = element;
        this.element.classed('triangle', true);

        this.background = this.element.append('rect').attr('x', 0).attr('y', 0).attr('class', 'background');
        this.path = this.element.append('path');

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

        this.range.x.classed('triangle-range', true);
        this.range.y.classed('triangle-range', true);
        this.flag.start.x.classed('triangle-flag', true);
        this.flag.start.y.classed('triangle-flag', true);
        this.flag.end.x.classed('triangle-flag', true);
        this.flag.end.y.classed('triangle-flag', true);

        this.working.add(this.chart.onDidClick(this.click.bind(this)));
        this.working.add(this.chart.onDidMouseMove(this.mousemove.bind(this)));
        this.working.add(this.chart.onDidZoom(this.draw.bind(this)));
        this.working.add(this.chart.onDidCancel(() => this.panel.removeLayer(this.layer)));
        this.working.add(new Disposable(() => this.background.remove()));

        this.disposables.add(new Disposable(() => {
            this.range.x.remove();
            this.range.y.remove();
            this.flag.start.x.remove();
            this.flag.start.y.remove();
            this.flag.end.x.remove();
            this.flag.end.y.remove();
        }));

        this.handle = {
            start: this.element.append('circle').attr('r', 5).classed('handle', true),
            middle: this.element.append('circle').attr('r', 5).classed('handle', true),
            end: this.element.append('circle').attr('r', 5).classed('handle', true)
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

        if(this.end){
            this.end = {x: this.chart.scale.invert(event.offsetX), y: this.panel.scale.invert(event.offsetY)};
        }else{
            this.middle = {x: this.chart.scale.invert(event.offsetX), y: this.panel.scale.invert(event.offsetY)};
        }

        this.draw();
    }

    click({event, target}){
        if(target !== this.panel) return;

        if(this.end){
            this.end = {x: this.chart.scale.invert(event.offsetX), y: this.panel.scale.invert(event.offsetY)};
            this.working.dispose();
            this.working = null;
            this.done = true;
            this.chart.done();
            this.element.on('click', this.select());
        }else{
            this.middle = {x: this.chart.scale.invert(event.offsetX), y: this.panel.scale.invert(event.offsetY)};
            this.end = _.clone(this.middle);
        }

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
        const md = new Date(Math.round(this.middle.x.getTime() / this.chart.granularity) * this.chart.granularity);

        const sx = this.chart.scale(sd);
        const mx = this.chart.scale(md);

        const sy = this.panel.scale(this.start.y);
        const my = this.panel.scale(this.middle.y);

        const sv = this.start.y.toFixed(this.chart.precision);
        const mv = this.middle.y.toFixed(this.chart.precision);

        const selected = this.layer.isSelected();
        const hidden = !selected;

        this.element.classed('selected', selected);
        this.range.x.classed('hidden', hidden);
        this.range.y.classed('hidden', hidden);
        this.flag.start.x.classed('hidden', hidden);
        this.flag.start.y.classed('hidden', hidden);
        this.flag.end.x.classed('hidden', hidden);
        this.flag.end.y.classed('hidden', hidden);

        this.handle.start.attr('cx', sx).attr('cy', sy);
        this.handle.middle.attr('cx', mx).attr('cy', my);



        let start, end, ed, ex, ey, ev;


        if(this.end === null){
            //We only have two points to work with, so let's just draw a line
            start = {
                x: Math.min(sx, mx),
                y: Math.min(sy, my),
                d: Math.min(sd, md),
                v: Math.min(sv, mv)
            };

            end = {
                x: Math.max(sx, mx),
                y: Math.max(sy, my),
                d: Math.max(sd, md),
                v: Math.max(sv, mv)
            };

            this.path.attr('d', `M ${sx} ${sy} L ${mx} ${my}`);
            this.handle.end.classed('hide', true);
        }else{
            ed = new Date(Math.round(this.end.x.getTime() / this.chart.granularity) * this.chart.granularity);
            ex = this.chart.scale(ed);
            ey = this.panel.scale(this.end.y)
            ev = this.end.y.toFixed(this.chart.precision);

            start = {
                x: Math.min(sx, mx, ex),
                y: Math.min(sy, my, ey),
                d: Math.min(sd, md, ed),
                v: Math.min(sv, mv, ev)
            };

            end = {
                x: Math.max(sx, mx, ex),
                y: Math.max(sy, my, ey),
                d: Math.max(sd, md, ed),
                v: Math.max(sv, mv, ev)
            };

            this.path.attr('d', `M ${sx} ${sy} L ${mx} ${my} L ${ex} ${ey} Z`);
            this.handle.end.attr('cx', ex).attr('cy', ey).classed('hide', false);
        }

        this.range.x.select('rect').attr('x', start.x).attr('width', end.x - start.x);
        this.range.y.select('rect').attr('y', start.y).attr('height', end.y - start.y);

        this.flag.start.x.attr('transform', `translate(${start.x}, 0)`).select('text').text(moment(start.d).format('YYYY-MM-DD HH:mm:ss'));
        this.flag.end.x.attr('transform', `translate(${end.x - X_FLAG_WIDTH}, 0)`).select('text').text(moment(end.d).format('YYYY-MM-DD HH:mm:ss'));

        this.flag.start.y.attr('transform', `translate(0, ${start.y})`).select('text').text(start.v);
        this.flag.end.y.attr('transform', `translate(0, ${end.y - FLAG_HEIGHT})`).select('text').text(end.v);
    }

    destroy(){
        if(this.working) this.working.dispose();
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'triangle',
    type: 'drawing',
    settings: {},
    title: 'Triangle',
    description: 'Draw a triangle on the chart.',
    selectable: true,
    instance: params => new Triangle(params)
};
