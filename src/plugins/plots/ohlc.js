const {CompositeDisposable, Disposable} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class OHLC {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;
        this.padding = 1;

        this.element.classed('ohlc', true);

        this.body = this.body.bind(this);
    }

    title(){
        return `OHLC Bars`;
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
            name: 'ohlc'
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

        let bar = this.element.selectAll('path.bar')
            .data(data, d => d.date.getTime())
            .attr('class', d => (d.open > d.close) ? 'bar down' : 'bar up')
            .attr('d', this.body);

        bar.enter()
            .append('path')
            .attr('d', this.body)
            .attr('class', d => (d.open > d.close) ? 'bar down' : 'bar up');

        bar.exit().remove();
    }

    destroy(){
        this.disposables.dispose();
    }

    body(d){
        let w = Math.max((this.chart.bandwidth - (2 * this.padding)) / 3, 1),
            x = this.chart.scale(d.date),
            open = this.panel.scale(d.open),
            close = this.panel.scale(d.close),
            high = this.panel.scale(d.high),
            low = this.panel.scale(d.low),
            oc = Math.max(low + w / 2, Math.min(high - w / 2, open)),
            cc = Math.max(low + w / 2, Math.min(high - w / 2, close));

        return `M ${x - w / 2} ${high - w / 2}
                h ${w}
                v ${close - high}
                h ${w}
                v ${w}
                h ${-w}
                V ${low + w / 2}
                h ${-w}
                v ${open - low}
                h ${-w}
                v ${-w},
                h ${w}
                Z`;
    }
}

module.exports = {
    name: 'ohlc',
    type: 'plot',
    settings: {},
    title: 'OHLC Bars',
    description: 'Plot open-high-low-close bars.',
    instance: params => new OHLC(params)
};
