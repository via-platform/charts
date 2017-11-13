const {CompositeDisposable, Disposable} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');

class Line {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;

        //TODO customize these properties
        this.stroke = 1.5;
        this.property = 'close';

        this.element.classed('line', true);

        this.line = d3.line()
            .x(d => this.chart.scale(d.date))
            .y(d => this.panel.scale(d.close));

        this.line = this.line.bind(this);
    }

    serialize(){
        return {
            version: 1,
            name: 'line'
        };
    }

    domain(){
        let [start, end] = this.chart.scale.domain();
        let data = this.chart.data.fetch({start, end});

        if(data.length){
            return [ _.min(data.map(d => d.low)), _.max(data.map(d => d.high)) ];
        }
    }

    draw(){
        let [start, end] = this.chart.scale.domain();

        start.setTime(start.getTime() - this.chart.granularity);
        end.setTime(end.getTime() + this.chart.granularity);

        let data = this.chart.data.fetch({start, end});

        this.element.selectAll('path').remove();

        this.element.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', this.stroke)
            .attr('d', this.line);

    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'line',
    type: 'plot',
    settings: {},
    instance: params => new Line(params)
};
