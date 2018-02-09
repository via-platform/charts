const {CompositeDisposable, Disposable} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

// const FLAG_HEIGHT = 20;
const AXIS_WIDTH = 60;

class Candlestick {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;
        this.padding = 0.2;

        this.element.classed('candlestick', true);
        this.body = this.body.bind(this);
        this.wick = this.wick.bind(this);
    }

    title(){
        return `Candlesticks`;
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
            name: 'candlestick'
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
        let data = this.chart.data.fetch({start, end}).sort((a, b) => a.date - b.date);

        let body = this.element.selectAll('path.candle.body')
            .data(data, d => d.date.getTime())
            .attr('class', d => (d.open > d.close) ? 'candle body down' : 'candle body up')
            .attr('d', this.body);

        body.enter()
            .append('path')
            .attr('d', this.body)
            .attr('class', d => (d.open > d.close) ? 'candle body down' : 'candle body up');

        body.exit().remove();

        let wick = this.element.selectAll('path.candle.wick')
            .data(data, d => d.date.getTime())
            .attr('class', d => (d.open > d.close) ? 'candle wick down' : 'candle wick up')
            .attr('d', this.wick);

        wick.enter()
            .append('path')
            .attr('class', d => (d.open > d.close) ? 'candle wick down' : 'candle wick up')
            .attr('d', this.wick);

        wick.exit().remove();
    }

    destroy(){
        this.disposables.dispose();
    }

    body(d){
        let width = Math.min(this.chart.bandwidth - 2, Math.floor(this.chart.bandwidth * (1 - this.padding) - 1));
        let x = this.chart.scale(d.date) - width / 2;
        let open = this.panel.scale(d.open);
        let close = this.panel.scale(d.close);

        if(Math.abs(open - close) < 1){
            if(close < open){
                close = open - 1;
            }else{
                open = close + 1;
            }
        }

        return `M ${x - 0.5} ${open} h ${width} V ${close} h ${-1 * width} Z`;
    }

    wick(d){
        let x = Math.round(this.chart.scale(d.date)),
            open = this.panel.scale(d.open),
            close = this.panel.scale(d.close),
            high = this.panel.scale(d.high),
            low = this.panel.scale(d.low);

        return `M ${x - 0.5} ${high} V ${Math.min(open, close)} M ${x - 0.5} ${Math.max(open, close)} V ${low}`;
    }
}

module.exports = {
    name: 'candlestick',
    type: 'plot',
    settings: {},
    title: 'Candlesticks',
    description: 'Plot candlesticks.',
    instance: params => new Candlestick(params)
};
