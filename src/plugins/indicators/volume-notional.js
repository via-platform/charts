const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class VolumeNotional {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;
        this.padding = 0.6;

        this.element.classed('volume-notional', true);

        this.body = this.body.bind(this);
    }

    serialize(){
        return {
            version: 1,
            name: 'volume-notional'
        };
    }

    title(){
        return `Notional Volume`;
    }

    value(band){
        const data = _.first(this.chart.data.fetch({start: band, end: band})) || {};
        const aggregation = this.chart.market ? this.chart.market.precision.price : 2;
        const value = (_.isUndefined(data) || _.isUndefined(data.volume_notional)) ? '-' : data.volume_notional.toFixed(aggregation);
        const quote = this.chart.market ? this.chart.market.quote : '';

        return $.div({classList: 'value'},
            $.span({classList: 'available first'}, value),
            quote
        );
    }

    domain(){
        let [start, end] = this.chart.scale.domain();
        let data = this.chart.data.fetch({start, end});

        if(data.length){
            return [0, _.max(data.map(d => d.volume_notional)) * 1.2];
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
        let w = Math.max(1, Math.min(this.chart.bandwidth - 2, Math.floor(this.chart.bandwidth * (1 - this.padding) - 1))),
            vol = this.panel.scale(d.volume_notional),
            x = this.chart.scale(d.date) - w / 2,
            y = this.panel.scale.range()[1] + 10;

        return `M ${x} ${vol} h ${w} V ${y} h ${-w} Z`;
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'volume-notional',
    type: 'indicator',
    settings: {},
    title: 'Notional Trading Volume',
    description: 'A volume bar for each time period corresponding to the total amount of notional volume traded.',
    instance: params => new VolumeNotional(params)
};
