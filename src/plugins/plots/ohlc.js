const {CompositeDisposable, Disposable} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');

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
