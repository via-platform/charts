const {CompositeDisposable, Disposable} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');

class Volume {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;
        this.padding = 0.4;

        this.element.classed('volume', true);

        this.body = this.body.bind(this);
    }

    serialize(){
        return {
            version: 1,
            name: 'volume'
        };
    }

    domain(){
        let [start, end] = this.chart.scale.domain();
        let data = this.chart.data.fetch({start, end});

        if(data.length){
            return [0, _.max(data.map(d => d.volume)) * 1.2];
        }
    }

    draw(){
        let [start, end] = this.chart.scale.domain();
        let data = this.chart.data.fetch({start, end});

        let body = this.element.selectAll('path')
            .data(data, d => d.date.getTime())
            .attr('class', d => (d.open > d.close) ? 'down' : 'up')
            .attr('d', this.body);

        body.enter()
                .append('path')
                .attr('d', this.body)
                .attr('class', d => (d.open > d.close) ? 'down' : 'up');

        body.exit().remove();
    }

    body(d){
        let w = Math.min(this.chart.bandwidth - 2, Math.floor(this.chart.bandwidth * (1 - this.padding) - 1)),
            vol = this.panel.scale(d.volume),
            x = this.chart.scale(d.date) - w / 2,
            y = this.panel.scale(0);

        return `M ${x} ${vol} h ${w} V ${y} h ${-w} Z`;
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'volume',
    type: 'indicator',
    settings: {},
    instance: params => new Volume(params)
};
