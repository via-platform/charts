const {CompositeDisposable, Disposable} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');

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
        let data = this.chart.data.fetch({start, end});

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
    name: 'candlestick',
    type: 'plot',
    settings: {},
    instance: params => new Candlestick(params)
};
