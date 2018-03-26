const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class HeikinAshi {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;
        this.padding = 0.2;
        this.candles = [];

        this.element.classed('heikin-ashi', true);

        this.body = this.body.bind(this);
        this.wick = this.wick.bind(this);
    }

    title(){
        return `Heikin-Ashi`;
    }

    value(band){
        const data = this.candles.find(candle => candle.date.getTime() === band.getTime()) || {};
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
            name: 'heikin-ashi'
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

        let data = this.chart.data.fetch({start, end}).sort((a, b) => a.date - b.date);
        this.candles = [];

        if(!data.length){
            return;
        }

        //Calculate the first candle
        let first = _.first(data);

        this.candles.push({
            date: first.date,
            open: (first.open + first.close) / 2,
            close: (first.open + first.close + first.high + first.low) / 4,
            high: first.high,
            low: first.low,
            incomplete: true
        });

        for(let i = 1; i < data.length; i++){
            let candle = data[i], previous = data[i - 1];
            let open = (previous.open + previous.close) / 2;
            let close = (candle.open + candle.close + candle.high + candle.low) / 4;

            this.candles.push({
                date: candle.date,
                open,
                close,
                high: Math.max(candle.high, open, close),
                low: Math.min(candle.low, open, close)
            });
        }

        let body = this.element.selectAll('path.candle.body')
            .data(this.candles, d => d.date.getTime())
            .attr('class', d => (d.open > d.close) ? 'candle body down' : 'candle body up')
            .classed('incomplete', d => d.incomplete)
            .attr('d', this.body);

        body.enter()
            .append('path')
            .attr('d', this.body)
            .attr('class', d => (d.open > d.close) ? 'candle body down' : 'candle body up')
            .classed('incomplete', d => d.incomplete);

        body.exit().remove();

        let wick = this.element.selectAll('path.candle.wick')
            .data(this.candles, d => d.date.getTime())
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
    name: 'heikin-ashi',
    type: 'plot',
    settings: {},
    title: 'Heikin-Ashi Candlesticks',
    description: 'Plot Heikin-Ashi candlesticks.',
    instance: params => new HeikinAshi(params)
};
