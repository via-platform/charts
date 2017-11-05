const {CompositeDisposable, Disposable, Symbols} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');

class Candlestick {
    constructor({chart, state, layer}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;

        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.element.classList.add('layer', 'candlestick', 'full-width', 'full-height');

        this.body = this.body.bind(this);
        this.wick = this.wick.bind(this);
        this.padding = 0.2; //TODO observe user preferences
        this.bandwidth = 10;
    }

    serialize(){
        return {
            version: 1,
            plugin: 'candlestick'
        };
    }

    extent(){

    }

    domain(){
        let [start, end] = this.chart.center.scale.x.domain();
        let data = this.data.fetch({start, end});

        if(data.length){
            return [ _.min(data.map(d => d.low)), _.max(data.map(d => d.high)) ];
        }
    }

    draw(){
        let [start, end] = this.chart.center.scale.x.domain();
        let data = this.data.fetch({start, end});
        let element = d3.select(this.element);
        // this.chart.center.zoomTranslateExtent();

        let body = element.selectAll('path.candle.body')
            .data(data, d => d.date.getTime())
            .attr('class', d => (d.open > d.close) ? 'candle body down' : 'candle body up')
            .attr('d', this.body);

        body.enter()
                .append('path')
                .attr('d', this.body)
                .attr('class', d => (d.open > d.close) ? 'candle body down' : 'candle body up');

        body.exit().remove();

        let wick = element.selectAll('path.candle.wick')
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
        let width = this.bandwidth,
            open = this.chart.center.scale.y(d.open),
            close = this.chart.center.scale.y(d.close),
            xValue = this.chart.center.scale.x(d.date) - width / 2;

        if(Math.abs(open - close) < 1){
            if(close < open){
                close = open - 1;
            }else{
                open = close + 1;
            }
        }

        return `M ${xValue} ${open} l ${width} 0 L ${xValue + width} ${close} l ${-1 * this.bandwidth} 0 L ${xValue} ${open}`;
    }

    wick(d){
        let width = this.bandwidth,
            open = this.chart.center.scale.y(d.open),
            close = this.chart.center.scale.y(d.close),
            xPoint = this.chart.center.scale.x(d.date),
            xValue = xPoint - width / 2,
            high = this.chart.center.scale.y(d.high),
            low = this.chart.center.scale.y(d.low),
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
