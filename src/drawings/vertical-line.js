const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const moment = require('moment');
const $ = etch.dom;
const AXIS_HEIGHT = 22;
const FLAG_HEIGHT = AXIS_HEIGHT - 2;
const X_FLAG_WIDTH = 114;

class VerticalLine {
    constructor({chart, element, panel, layer, params}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.layer = layer;
        this.value = this.chart.scale.invert(event.offsetX);

        this.element = element;
        this.element.classed('vertical-line', true);
        this.element.append('path');
        this.element.append('rect').attr('width', 5).attr('x', -2).attr('y', 0);
        this.element.on('click', this.click()).call(d3.drag().on('drag', this.drag()));

        this.element.append('circle')
            .attr('class', 'handle')
            .attr('cx', 0)
            .attr('r', 5);

        this.flag = this.chart.axis.flag();
        this.flag.classed('vertical-line-flag', true);

        this.disposables.add(new Disposable(() => this.flag.remove()));
        this.disposables.add(this.panel.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));

        this.resize();
    }

    drag(){
        const _this = this;

        return function(d){
            _this.value = _this.chart.scale.invert(d3.event.x);
            _this.draw();
            _this.chart.mousemove({event: d3.event, target: this.panel});
        };
    }

    click(){
        const _this = this;

        return function(d, i){
            if(d3.event.shiftKey) return;

            d3.event.stopPropagation();
            _this.chart.select(_this.layer);
        };
    }

    serialize(){
        return {
            version: 1,
            name: 'vertical-line'
        };
    }

    resize(){
        this.element.select('path').attr('d', `M 0 0 v ${this.panel.height}`);
        this.element.select('rect').attr('height', this.panel.height);
        this.element.select('circle').attr('cy', this.panel.height / 2);
    }

    draw(){
        const candle = new Date(Math.round(this.value.getTime() / this.chart.granularity) * this.chart.granularity);
        const position = this.chart.scale(candle) - (X_FLAG_WIDTH / 2);

        if(_.isDate(this.value)){
            this.flag.classed('hide', false)
                .attr('transform', `translate(${position}, 0)`)
                .select('text')
                    .text(moment(candle).format('YYYY-MM-DD HH:mm:ss'));

            this.element.classed('hide', false)
                .classed('selected', this.chart.selected === this.layer)
                .attr('transform', `translate(${Math.round(this.chart.scale(candle)) - 0.5}, 0)`);
        }else{
            this.flag.classed('hide', true);
            this.element.classed('hide', true);
        }
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'vertical-line',
    type: 'drawing',
    settings: {},
    title: 'Vertical Line',
    description: 'Add a vertical line to your chart.',
    selectable: true,
    instance: params => new VerticalLine(params)
};
