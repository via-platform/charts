const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class RotatedRectangle {
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
        this.element.classed('rotated-rectangle', true);

        this.background = this.element.append('rect').attr('x', 0).attr('y', 0).attr('class', 'background');
        this.path = this.element.append('path');

        // this.range = {
        //     x: this.chart.axis.range(),
        //     y: this.panel.axis.range()
        // };

        // this.flag = {
        //     start: {
        //         x: this.chart.axis.flag(),
        //         y: this.panel.axis.flag()
        //     },
        //     middle: {
        //         x: this.chart.axis.flag(),
        //         y: this.panel.axis.flag()
        //     },
        //     end: {
        //         x: this.chart.axis.flag(),
        //         y: this.panel.axis.flag()
        //     }
        // };

        // this.range.x.classed('ellipse-range', true);
        // this.range.y.classed('ellipse-range', true);
        // this.flag.start.x.classed('ellipse-flag', true);
        // this.flag.start.y.classed('ellipse-flag', true);
        // this.flag.middle.x.classed('ellipse-flag', true);
        // this.flag.middle.y.classed('ellipse-flag', true);
        // this.flag.end.x.classed('ellipse-flag', true);
        // this.flag.end.y.classed('ellipse-flag', true);

        this.working.add(this.chart.onDidClick(this.click.bind(this)));
        this.working.add(this.chart.onDidMouseMove(this.mousemove.bind(this)));
        this.working.add(this.chart.onDidZoom(this.draw.bind(this)));
        this.working.add(this.chart.onDidCancel(() => this.panel.removeLayer(this.layer)));
        this.working.add(new Disposable(() => this.background.remove()));
        this.working.add(new Disposable(() => this.line.remove()));

        // this.disposables.add(new Disposable(() => {
        //     this.range.x.remove();
        //     this.range.y.remove();
        //     this.flag.start.x.remove();
        //     this.flag.start.y.remove();
        //     this.flag.middle.x.remove();
        //     this.flag.middle.y.remove();
        //     this.flag.end.x.remove();
        //     this.flag.end.y.remove();
        // }));

        this.handle = {
            topRight: this.element.append('circle').attr('r', 5).classed('handle', true),
            topMiddle: this.element.append('circle').attr('r', 5).classed('handle', true),
            topLeft: this.element.append('circle').attr('r', 5).classed('handle', true),
            bottomRight: this.element.append('circle').attr('r', 5).classed('handle', true),
            bottomMiddle: this.element.append('circle').attr('r', 5).classed('handle', true),
            bottomLeft: this.element.append('circle').attr('r', 5).classed('handle', true)
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
        // this.range.x.classed('hidden', hidden);
        // this.range.y.classed('hidden', hidden);
        // this.flag.start.x.classed('hidden', hidden);
        // this.flag.start.y.classed('hidden', hidden);
        // this.flag.end.x.classed('hidden', hidden);
        // this.flag.end.y.classed('hidden', hidden);

        this.handle.topMiddle.attr('cx', sx).attr('cy', sy);
        this.handle.bottomMiddle.attr('cx', mx).attr('cy', my);

        if(this.end === null){
            //We only have two points to work with, so let's just draw a line
            this.path.attr('d', `M ${sx} ${sy} L ${mx} ${my}`);

            this.handle.topLeft.classed('hide', true);
            this.handle.topRight.classed('hide', true);
            this.handle.bottomLeft.classed('hide', true);
            this.handle.bottomRight.classed('hide', true);

            return;
        }

        const ed = new Date(Math.round(this.end.x.getTime() / this.chart.granularity) * this.chart.granularity);
        const ex = this.chart.scale(ed);
        const ey = this.panel.scale(this.end.y)
        const ev = this.end.y.toFixed(this.chart.precision);

        const m = (my - sy) / (mx - sx);
        const im = 1 / m;

        const dx = ex - mx;
        const dy = ey - my;











        this.path.attr('d', `M ${sx + dx} ${sy + dy} L ${sx - dx} ${sy - dy} L ${mx - dx} ${my - dy} L ${ex} ${ey} Z`);

        this.handle.topLeft.attr('cx', sx + dx).attr('cy', sy + dy).classed('hide', false);
        this.handle.topRight.attr('cx', sx - dx).attr('cy', sy - dy).classed('hide', false);
        this.handle.bottomRight.attr('cx', mx - dx).attr('cy', my - dy).classed('hide', false);
        this.handle.bottomLeft.attr('cx', ex).attr('cy', ey).classed('hide', false);


        // const start = {
        //     x: Math.min(sx, mx),
        //     y: Math.min(sy, my)
        // };
        //
        // const middle = {
        //     x: Math.min(sx, mx),
        //     y: Math.min(sy, my)
        // };
        //
        // this.range.x.select('rect').attr('x', start.x).attr('width', middle.x - start.x);
        // this.range.y.select('rect').attr('y', start.y).attr('height', middle.y - start.y);
        //
        // this.flag.start.x.attr('transform', `translate(${start.x}, 0)`).select('text').text(moment(sd).format('YYYY-MM-DD HH:mm:ss'));
        // this.flag.middle.x.attr('transform', `translate(${middle.x - (X_FLAG_WIDTH / 2)}, 0)`).select('text').text(moment(sd).format('YYYY-MM-DD HH:mm:ss'));
        // this.flag.end.x.attr('transform', `translate(${ex - X_FLAG_WIDTH}, 0)`).select('text').text(moment(ed).format('YYYY-MM-DD HH:mm:ss'));
        //
        // this.flag.start.y.attr('transform', `translate(0, ${sy})`).select('text').text(sv);
        // this.flag.middle.y.attr('transform', `translate(0, ${my - (FLAG_HEIGHT / 2)})`).select('text').text(sv);
        // this.flag.end.y.attr('transform', `translate(0, ${ey})`).select('text').text(ev);
    }

    destroy(){
        if(this.working) this.working.dispose();
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'rotated-rectangle',
    type: 'drawing',
    settings: {},
    title: 'Rotated Rectangle',
    description: 'Draw a rotated rectangle on the chart.',
    selectable: true,
    instance: params => new RotatedRectangle(params)
};
