const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class OHLC {
    constructor({chart, state, element, panel, layer}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.layer = layer;
        this.element = element;
        this.padding = 1;

        this.element.classed('ohlc', true);
        this.element.on('click', this.click());

        this.body = this.body.bind(this);
    }

    click(){
        const _this = this;

        return function(d, i){
            if(d3.event.shiftKey) return;

            d3.event.stopPropagation();
            _this.chart.select(_this.layer);
        };
    }

    title(){
        return `OHLC Bars`;
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
            name: 'ohlc'
        };
    }

    domain(){
        let [start, end] = this.chart.scale.domain();
        let data = this.chart.data.fetch({start, end}).filter(candle => candle.price_close);

        if(data.length){
            return [ _.min(data.map(d => d.price_low)), _.max(data.map(d => d.price_high)) ];
        }
    }

    draw(){
        let [start, end] = this.chart.scale.domain();
        let data = this.chart.data.fetch({start, end}).filter(candle => candle.price_close);

        let bar = this.element.selectAll('path.bar')
            .data(data, d => d.time_period_start.getTime())
            .attr('class', d => (d.price_open > d.price_close) ? 'bar down' : 'bar up')
            .attr('d', this.body);

        bar.enter()
            .append('path')
            .attr('d', this.body)
            .attr('class', d => (d.price_open > d.price_close) ? 'bar down' : 'bar up');

        bar.exit().remove();

        if(this.layer.isSelected()){
            let handle = this.element.selectAll('circle.handle')
                .data(data.filter(d => d.price_close && d.price_open && d.time_period_start.getTime() % (this.chart.granularity * 10) === 0), d => d.time_period_start.getTime())
                .attr('class', 'handle')
                .attr('cx', d => this.chart.scale(d.time_period_start))
                .attr('cy', d => this.panel.scale((d.price_open + d.price_close) / 2))
                .attr('r', 4);

            handle.enter()
                .append('circle')
                .attr('class', 'handle')
                .attr('cx', d => this.chart.scale(d.time_period_start))
                .attr('cy', d => this.panel.scale(d3.mean([d.price_open, d.price_close])))
                .attr('r', 4);

            handle.exit().remove();
        }else{
            this.element.selectAll('circle.handle').remove();
        }
    }

    destroy(){
        this.disposables.dispose();
    }

    body(d){
        let w = Math.max((this.chart.bandwidth - (2 * this.padding)) / 3, 1),
            x = this.chart.scale(d.time_period_start),
            open = this.panel.scale(d.price_open),
            close = this.panel.scale(d.price_close),
            high = this.panel.scale(d.price_high),
            low = this.panel.scale(d.price_low),
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
    selectable: true,
    description: 'Plot open-high-low-close bars.',
    instance: params => new OHLC(params)
};
