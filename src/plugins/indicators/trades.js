const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class Trades {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;
        this.padding = 0.6;

        this.element.classed('trades', true);

        this.body = this.body.bind(this);
    }

    serialize(){
        return {
            version: 1,
            name: 'volume'
        };
    }

    title(){
        return `Number of Trades`;
    }

    value(band){
        const data = _.first(this.chart.data.fetch({start: band, end: band})) || {};
        const aggregation = this.chart.market ? this.chart.market.aggregation : 2;
        const value = (_.isUndefined(data) || _.isUndefined(data.trades)) ? '-' : data.trades.toFixed(aggregation);
        const base = this.chart.market ? this.chart.market.base : '';

        return $.div({classList: 'value'},
            $.span({classList: 'available first'}, value)
        );
    }

    domain(){
        const [start, end] = this.chart.scale.domain();
        const data = this.chart.data.fetch({start, end});

        if(data.length){
            return [0, d3.max(data, d => d.trades) * 1.2];
        }
    }

    draw(){
        const [start, end] = this.chart.scale.domain();
        const data = this.chart.data.fetch({start, end});

        const body = this.element.selectAll('path')
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
        const w = Math.max(1, Math.min(this.chart.bandwidth - 2, Math.floor(this.chart.bandwidth * (1 - this.padding) - 1))),
            vol = this.panel.scale(d.trades),
            x = this.chart.scale(d.date) - w / 2,
            y = this.panel.scale.range()[1] + 10;

        return `M ${x} ${vol} h ${w} V ${y} h ${-w} Z`;
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'trades',
    type: 'indicator',
    settings: {},
    title: 'Number of Trades',
    description: 'A bar for each time period corresponding to the number of individual trades.',
    instance: params => new Trades(params)
};
