const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;
const AXIS_HEIGHT = 22;
const FLAG_HEIGHT = AXIS_HEIGHT - 3;

class HorizontalLine {
    constructor({chart, element, panel, layer, params}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.layer = layer;
        this.value = this.panel.scale.invert(event.offsetY);

        this.element = element;
        this.element.classed('horizontal-line', true);
        this.element.append('path');
        this.element.append('rect').attr('height', 5).attr('y', -2).attr('x', 0);
        this.element.on('click', this.click()).call(d3.drag().on('drag', this.drag()));

        this.element.append('circle')
            .attr('class', 'handle')
            .attr('cy', 0)
            .attr('r', 5);

        this.flag = this.panel.axis.flag();
        this.flag.classed('horizontal-line-flag', true);

        this.disposables.add(new Disposable(() => this.flag.remove()));
        this.disposables.add(this.panel.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));

        this.resize();
    }

    drag(){
        const _this = this;

        return function(d){
            _this.value = _this.panel.scale.invert(d3.event.y);
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
            name: 'horizontal-line'
        };
    }

    resize(){
        this.element.select('path').attr('d', `M 0 0 h ${this.panel.width}`);
        this.element.select('rect').attr('width', this.panel.width);
        this.element.select('circle').attr('cx', this.panel.width / 2);
    }

    draw(){
        if(_.isNumber(this.value)){
            this.flag.classed('hide', false)
                .attr('transform', `translate(0, ${Math.round(this.panel.scale(this.value)) - Math.ceil(FLAG_HEIGHT / 2)})`)
                .select('text')
                    .text(this.value.toFixed(this.chart.precision));

            this.element.classed('hide', false)
                .classed('selected', this.chart.selected === this.layer)
                .attr('transform', `translate(0, ${Math.round(this.panel.scale(this.value)) - 0.5})`);
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
    name: 'horizontal-line',
    type: 'drawing',
    settings: {},
    title: 'Horizontal Line',
    description: 'Add a horizontal line to your chart.',
    selectable: true,
    instance: params => new HorizontalLine(params)
};
