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
        const direction = data ? ((data.close >= data.open) ? 'up' : 'down') : 'unavailable';

        return $.div({classList: 'value'},
            'O',
            $.span({classList: direction}, data.open && data.open.toFixed(this.chart.precision) || '-'),
            'H',
            $.span({classList: direction}, data.high && data.high.toFixed(this.chart.precision) || '-'),
            'L',
            $.span({classList: direction}, data.low && data.low.toFixed(this.chart.precision) || '-'),
            'C',
            $.span({classList: direction}, data.close && data.close.toFixed(this.chart.precision) || '-')
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

        if(this.layer.isSelected()){
            let handle = this.element.selectAll('circle.handle')
                .data(data.filter(d => d.close && d.open && d.date.getTime() % (this.chart.granularity * 10) === 0), d => d.date.getTime())
                .attr('class', 'handle')
                .attr('cx', d => this.chart.scale(d.date))
                .attr('cy', d => this.panel.scale((d.open + d.close) / 2))
                .attr('r', 4);

            handle.enter()
                .append('circle')
                .attr('class', 'handle')
                .attr('cx', d => this.chart.scale(d.date))
                .attr('cy', d => this.panel.scale(d3.mean([d.open, d.close])))
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
    selectable: true,
    description: 'Plot open-high-low-close bars.',
    instance: params => new OHLC(params)
};
