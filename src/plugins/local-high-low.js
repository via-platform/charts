const {Disposable, CompositeDisposable} = require('event-kit');
const d3 = require('d3');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;
const AXIS_HEIGHT = 22;
const FLAG_HEIGHT = AXIS_HEIGHT - 3;

class LocalHighLow {
    constructor({chart}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = chart.center();
        this.element = this.panel.svg.append('path').attr('class', 'local-high-low hide');

        this.arrows = {
            high: this.element.append('g'),
            low: this.element.append('g')
        };

        this.arrows.high.append('text');
        this.arrows.high.append('path');

        this.arrows.low.append('text');
        this.arrows.low.append('path');

        this.disposables.add(this.panel.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));
        this.disposables.add(this.panel.onDidDraw(this.draw.bind(this)));

        this.high = null;
        this.low = null;

        this.resize();
    }

    serialize(){
        return {
            version: 1,
            name: 'local-high-low'
        };
    }

    resize(){
        // this.element.attr('d', `M 0 0 h ${this.panel.width}`);
    }

    title(){
        return `Local High & Low`;
    }

    value(){
        return $.div({classList: 'value'},
            'H',
            $.span({classList: this.high ? 'up' : 'unavailable'}, this.high ? this.high.toFixed(this.chart.precision) : '-'),
            'L',
            $.span({classList: this.low ? 'down' : 'unavailable'}, this.low ? this.low.toFixed(this.chart.precision) : '-'),
            '∆',
            $.span({classList: (this.high && this.low) ? 'available' : 'unavailable'}, (this.high && this.low) ? (this.high - this.low).toFixed(this.chart.precision) : '-')
        );
    }

    draw(){
        const [start, end] = this.chart.scale.domain();
        const data = this.chart.data.fetch({start, end}).filter(candle => candle.price_close);
        const precision = this.chart.market ? this.chart.market.precision.price : 8;

        this.high = d3.max(data, d => d.price_high);
        this.low = d3.min(data, d => d.price_low);

        if(data.length){
            this.high = d3.max(data, d => d.price_high);
            this.low = d3.min(data, d => d.price_low);

            // this.element.classed('hide', false)
            //     .attr('transform', `translate(0, ${Math.round(this.panel.scale(value.price_close)) - 0.5})`)
            //     .classed('up', value.price_close >= value.price_open)
            //     .classed('down', value.price_close < value.price_open);
        }else{
            this.high = null;
            this.low = null;

            this.element.classed('hide', true);
        }
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'local-high-low',
    type: 'overlay',
    settings: {
        selectable: false,
        allowedLocations: 'center',
        defaultPriority: 100
    },
    title: 'Local High & Low',
    description: 'Displays arrows indicating the lowest and highest point on the chart.',
    instance: params => new LocalHighLow(params)
};
