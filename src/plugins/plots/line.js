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
        const direction = data ? ((data.close >= data.open) ? 'up' : 'down') : 'unavailable';
        const aggregation = this.chart.symbol ? this.chart.symbol.aggregation : 2;

        //TODO we should fix these values to some sort of user preference or per-symbol basis
        return $.div({classList: 'value'},
            'O',
            $.span({classList: direction}, data.open && data.open.toFixed(aggregation) || '-'),
            'H',
            $.span({classList: direction}, data.high && data.high.toFixed(aggregation) || '-'),
            'L',
            $.span({classList: direction}, data.low && data.low.toFixed(aggregation) || '-'),
            'C',
            $.span({classList: direction}, data.close && data.close.toFixed(aggregation) || '-')
        );
    }

    serialize(){
        return {
            version: 1,
            name: 'line'
        };
    }

    domain(){
        let [start, end] = this.chart.scale.domain();
        let data = this.chart.data.fetch({start, end}).sort((a, b) => a.date - b.date);

        if(data.length){
            return [ _.min(data.map(d => d.low)), _.max(data.map(d => d.high)) ];
        }
    }

    draw(){
        let [start, end] = this.chart.scale.domain();

        start.setTime(start.getTime() - this.chart.granularity);
        end.setTime(end.getTime() + this.chart.granularity);

        let data = this.chart.data.fetch({start, end}).sort((a, b) => a.date - b.date);

        this.element.selectAll('path').remove();
        this.element.append('path').classed('stroke', true).datum(data).attr('d', this.stroke);
    }

    stroke(data){
        if(data.length < 2){
            return '';
        }

        return 'M ' + data.map(d => this.chart.scale(d.date) + ' ' + this.panel.scale(d.close)).join(' L ');
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
