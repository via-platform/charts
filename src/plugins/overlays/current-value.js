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
        this.disposables.add(via.config.observe('charts.showCurrentValueLine', this.draw.bind(this)));

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
        //This should be good enough because we send a snapshot of the latest candle upon subscribing to the stream
        const value = this.chart.data.last();

        if(value){
            this.last = via.fn.number.formatPrice(value.price_close, this.chart.market);

            this.flag.classed('hide', false)
                .classed('up', (value.price_close >= value.price_open))
                .classed('down', (value.price_close < value.price_open))
                .attr('transform', `translate(0, ${Math.round(this.panel.scale(value.price_close)) - Math.ceil(FLAG_HEIGHT / 2)})`)
                .select('text')
                    .text(this.last);

            this.element.classed('hide', false)
                .attr('transform', `translate(0, ${Math.round(this.panel.scale(value.price_close)) - 0.5})`)
                .classed('up', value.price_close >= value.price_open)
                .classed('down', value.price_close < value.price_open);
        }else{
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
