const {CompositeDisposable, Disposable} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');

class HeikinAshi {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;
        this.padding = 0.2;

        this.element.classed('heikin-ashi', true);

        this.body = this.body.bind(this);
        this.wick = this.wick.bind(this);
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
        let candles = [];

        if(!data.length){
            return;
        }

        //Calculate the first candle
        let first = _.first(data);

        candles.push({
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

            candles.push({
                date: candle.date,
                open,
                close,
                high: Math.max(candle.high, open, close),
                low: Math.min(candle.low, open, close)
            });
        }

        let body = this.element.selectAll('path.candle.body')
            .data(candles, d => d.date.getTime())
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
            .data(candles, d => d.date.getTime())
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
        let width = Math.min(this.chart.bandwidth - 2, Math.floor(this.chart.bandwidth * (1 - this.padding) - 1)),
            open = this.panel.scale(d.open),
            close = this.panel.scale(d.close),
            xValue = this.chart.scale(d.date) - width / 2;

        // if(isNaN(width) || isNaN(open) || isNaN(close) || isNaN(xValue)) debugger;

        if(Math.abs(open - close) < 1){
            if(close < open){
                close = open - 1;
            }else{
                open = close + 1;
            }
        }

        return `M ${xValue} ${open} l ${width} 0 L ${xValue + width} ${close} l ${-1 * width} 0 L ${xValue} ${open}`;
    }

    wick(d){
        let width = this.chart.bandwidth,
            open = this.panel.scale(d.open),
            close = this.panel.scale(d.close),
            xPoint = this.chart.scale(d.date),
            xValue = xPoint - width / 2,
            high = this.panel.scale(d.high),
            low = this.panel.scale(d.low),
            path = `M ${xPoint} ${high} L ${xPoint} ${Math.min(open, close)}`;

        return path + ` M ${xPoint} ${Math.max(open, close)} L ${xPoint} ${low}`;
    }
}

module.exports = {
    name: 'heikin-ashi',
    type: 'plot',
    settings: {},
    instance: params => new HeikinAshi(params)
};
