const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;
const AXIS_HEIGHT = 22;
const FLAG_HEIGHT = AXIS_HEIGHT - 3;

class BidAsk {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;

        this.element.classed('bid-ask', true).classed('hide', true);

        this.bid = this.element.append('g').attr('class', 'bid');
        this.ask = this.element.append('g').attr('class', 'ask');

        this.bid.append('path');
        this.bid.append('text').attr('alignment-baseline', 'hanging').attr('text-anchor', 'end').attr('y', 6).text('Hello World');

        this.ask.append('path');
        this.ask.append('text').attr('alignment-baseline', 'baseline').attr('text-anchor', 'end').attr('y', -6).text('Hello World');

        this.disposables.add(this.panel.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));
        this.disposables.add(this.panel.onDidDraw(this.draw.bind(this)));

        this.resize();
    }

    subscribe(){
        if(this.subscription){
            this.subscription.dispose();
            this.subscription = null;
        }

        if(this.chart.market){
            this.subscription = market.quotes.subscribe(this.draw.bind(this));
        }
    }

    serialize(){
        return {
            version: 1,
            name: 'bid-ask'
        };
    }

    resize(){
        this.element.selectAll('path').attr('d', `M 0 0 h ${this.panel.width}`);
        this.element.selectAll('text').attr('x', this.panel.width - 6);
    }

    title(){
        return `Bid & Ask`;
    }

    value(){
        if(this.chart.market){
            const {bid, ask} = this.chart.market.quotes.last();

            return $.div({classList: 'value'},
                $.span({classList: 'first up'}, bid.price.toFixed(this.chart.precision)),
                $.span({classList: 'down'}, ask.price.toFixed(this.chart.precision))
            );
        }

        return $.div({classList: 'value'}, $.span({classList: 'first unavailable'}, '-'), $.span({classList: 'unavailable'}, '-'));
    }

    draw(){
        this.panel.values.update();

        if(!this.chart.market){
            return this.element.classed('hide', true);
        }

        const {bid, ask} = this.chart.market.quotes.last();
        const precision = this.chart.market.precision.price;

        this.element.classed('hide', false);
        this.bid.attr('transform', `translate(0, ${Math.round(this.panel.scale(bid.price)) - 0.5})`);
        this.ask.attr('transform', `translate(0, ${Math.round(this.panel.scale(ask.price)) - 0.5})`);

        this.bid.select('text').text(bid.price.toFixed(precision));
        this.ask.select('text').text(ask.price.toFixed(precision));
    }

    destroy(){
        if(this.subscription){
            this.subscription.dispose();
        }

        this.disposables.dispose();
    }
}

module.exports = {
    name: 'bid-ask',
    type: 'overlay',
    settings: {
        selectable: true,
        allowedLocations: 'center',
        defaultPriority: 10
    },
    title: 'Bid & Ask Price',
    description: 'Displays lines on the chart center indicating the current bid and ask price of the market.',
    instance: params => new BidAsk(params)
};
