const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class Line {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;

        //TODO customize these properties
        this.property = 'close';

        this.element.classed('line', true);

        this.stroke = this.stroke.bind(this);
    }

    title(){
        return `Line Chart`;
    }

    value(band){
        const data = _.first(this.chart.data.fetch({start: band, end: band})) || {};
        const direction = data ? ((data.price_close >= data.price_open) ? 'up' : 'down') : 'unavailable';

        return $.div({classList: 'value'},
            'O',
            $.span({classList: direction}, data.price_open && data.price_open.toFixed(this.chart.precision) || '-'),
            'H',
            $.span({classList: direction}, data.price_high && data.price_high.toFixed(this.chart.precision) || '-'),
            'L',
            $.span({classList: direction}, data.price_low && data.price_low.toFixed(this.chart.precision) || '-'),
            'C',
            $.span({classList: direction}, data.price_close && data.price_close.toFixed(this.chart.precision) || '-')
        );
    }

    serialize(){
        return {
            version: 1,
            name: 'line'
        };
    }

    domain(){
        const [start, end] = this.chart.scale.domain();
        const data = this.chart.data.fetch({start, end}).filter(candle => candle.price_close).sort((a, b) => a.time_period_start - b.time_period_start);

        if(data.length){
            return [ _.min(data.map(d => d.price_low)), _.max(data.map(d => d.price_high)) ];
        }
    }

    draw(){
        const [start, end] = this.chart.scale.domain();

        start.setTime(start.getTime() - this.chart.granularity);
        end.setTime(end.getTime() + this.chart.granularity);

        const data = this.chart.data.fetch({start, end}).filter(candle => candle.price_close).sort((a, b) => a.time_period_start - b.time_period_start);

        this.element.selectAll('path').remove();
        this.element.append('path').classed('stroke', true).datum(data).attr('d', this.stroke);
    }

    stroke(data){
        if(data.length < 2){
            return '';
        }

        return 'M ' + data.map(d => this.chart.scale(d.time_period_start) + ' ' + this.panel.scale(d.price_close)).join(' L ');
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'line',
    type: 'plot',
    settings: {},
    title: 'Line Chart',
    description: 'Plot a solid line.',
    instance: params => new Line(params)
};
