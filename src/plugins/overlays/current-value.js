const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;
const AXIS_HEIGHT = 22;
const FLAG_HEIGHT = AXIS_HEIGHT - 3;

class CurrentValue {
    constructor({chart}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = chart.center();
        this.element = this.panel.svg.append('path').attr('class', 'current-value hide');

        this.countdown = false;
        this.timer = null;

        this.flag = this.panel.axis.flag();
        this.flag.classed('current-value-flag', true).classed('hide', true);

        this.disposables.add(new Disposable(() => this.flag.remove()));
        this.disposables.add(this.panel.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));
        this.disposables.add(this.panel.onDidDraw(this.draw.bind(this)));

        this.resize();
    }

    serialize(){
        return {
            version: 1,
            name: 'current-value'
        };
    }

    resize(){
        this.element.attr('d', `M 0 0 h ${this.panel.width}`);
    }

    title(){
        const quote = this.chart.market ? this.chart.market.quote : '';
        return `Current Price (${quote})`;
    }

    value(){
        return $.div({classList: 'value'}, $.span({classList: 'available first'}, this.last || '-'));
    }

    draw(){
        const candle = new Date(Math.floor(Date.now() / this.chart.granularity) * this.chart.granularity);
        const value = _.first(this.chart.data.fetch({start: candle, end: candle}));
        const aggregation = this.chart.market ? this.chart.market.precision.price : 2;

        if(value){
            this.last = value.close.toFixed(aggregation);

            this.flag.classed('hide', false)
                .classed('up', (value.close >= value.open))
                .classed('down', (value.close < value.open))
                .attr('transform', `translate(0, ${Math.round(this.panel.scale(value.close)) - Math.ceil(FLAG_HEIGHT / 2)})`)
                .select('text')
                    .text(this.last);

            this.element.classed('hide', false)
                .attr('transform', `translate(0, ${Math.round(this.panel.scale(value.close)) - 0.5})`)
                .classed('up', value.close >= value.open)
                .classed('down', value.close < value.open);
        }else{
            //TODO This method is insufficient for dealing with non-24-hour symbols, or a halting of trading
            //TODO Hide the current value line because we don't know the current value
            this.flag.classed('hide', true);
            this.element.classed('hide', true);
        }
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'current-value',
    type: 'other',
    settings: {
        selectable: false,
        automatic: true,
        allowedLocations: 'center',
        defaultPriority: 100
    },
    title: 'Current Value',
    description: 'Displays a dotted line on the chart center indicating the current value of the symbol.',
    instance: params => new CurrentValue(params)
};
