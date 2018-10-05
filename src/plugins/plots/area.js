const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class Area {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;

        //TODO customize these properties
        this.property = 'close';

        this.element.classed('area', true);

        this.stroke = this.stroke.bind(this);
        this.fill = this.fill.bind(this);
    }

    title(){
        return `Area Chart`;
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
            name: 'area'
        };
    }

    domain(){
        const [start, end] = this.chart.scale.domain();
        const data = this.chart.data.fetch({start, end}).filter(candle => candle.price_close);

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
        this.element.append('path').classed('fill', true).datum(data).attr('d', this.fill);
    }

    stroke(data){
        if(data.length < 2){
            return '';
        }

        return 'M ' + data.map(d => this.chart.scale(d.time_period_start) + ' ' + this.panel.scale(d.price_close)).join(' L ');
    }

    fill(data){
        if(data.length < 2){
            return '';
        }

        const first = _.first(data);
        const last = _.last(data);
        const [top, bottom] = this.panel.scale.range();

        return 'M ' + data.map(d => this.chart.scale(d.time_period_start) + ' ' + this.panel.scale(d.price_close)).join(' L ') + ' V ' + bottom + ' H ' + this.chart.scale(first.time_period_start);
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'area',
    type: 'plot',
    settings: {},
    title: 'Area Chart',
    description: 'Plot a solid shape.',
    instance: params => new Area(params)
};
