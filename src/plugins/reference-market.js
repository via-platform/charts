const {Disposable, CompositeDisposable} = require('event-kit');
const d3 = require('d3');
const _ = require('underscore-plus');

const AXIS_HEIGHT = 22;
const FLAG_HEIGHT = AXIS_HEIGHT - 3;

class ReferenceMarket {
    constructor({chart}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = this.chart.center();

        //TODO customize these properties
        this.property = 'close';

        this.disposables.add(this.chart.onDidChangeMarket(this.attach.bind(this)));
        this.disposables.add(this.panel.onDidDraw(this.draw.bind(this)));
        this.disposables.add(this.panel.onDidDestroy(this.destroy.bind(this)));
    }

    attach(){
        if(this.referenceDisposable){
            this.referenceDisposable.dispose();
        }

        if(this.chart.market.reference_market_id){
            this.flag = this.panel.axis.flag().classed('shadow-value-flag', true);
            this.line = this.panel.svg.append('path').attr('class', 'reference-market');

            this.referenceDisposable = new Disposable(() => {
                this.flag.remove();
                this.line.remove();
            });
        }
    }

    title(){
        return `Reference Market`;
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
            name: 'reference-market'
        };
    }

    domain(){
        if(this.market){
            const [start, end] = this.chart.scale.domain();
            const data = this.chart.data.fetch({start, end}).filter(candle => candle.price_close).sort((a, b) => a.time_period_start - b.time_period_start);

            if(data.length){
                return [ _.min(data.map(d => d.price_low)), _.max(data.map(d => d.price_high)) ];
            }
        }
    }

    draw(){
        if(this.market){
            const [start, end] = this.chart.scale.domain();

            start.setTime(start.getTime() - this.chart.granularity);
            end.setTime(end.getTime() + this.chart.granularity);

            const data = this.chart.data.fetch({start, end}).filter(candle => candle.price_close).sort((a, b) => a.time_period_start - b.time_period_start);

            this.line.datum(data).attr('d', this.stroke);
        }
    }

    stroke(data){
        if(data.length < 2){
            return '';
        }

        return 'M ' + data.map(d => this.chart.scale(d.time_period_start) + ' ' + this.panel.scale(d.price_close)).join(' L ');
    }

    destroy(){
        if(this.referenceDisposable){
            this.referenceDisposable.dispose();
        }

        this.disposables.dispose();
    }
}

module.exports = {
    name: 'reference-market',
    type: 'other',
    settings: {},
    title: 'Reference Market',
    description: 'Shows a line indicating the value of the underlying reference market or index.',
    instance: params => new ReferenceMarket(params)
};
