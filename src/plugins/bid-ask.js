const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const ChartLayer = require('../chart-layer');
const etch = require('etch');
const $ = etch.dom;
const AXIS_HEIGHT = 22;
const FLAG_HEIGHT = AXIS_HEIGHT - 3;

module.exports = class BidAsk extends ChartLayer {
    static describe(){
        return {
            name: 'bid-ask',
            title: 'Bid & Ask Price',
            description: 'Displays lines on the chart center indicating the current bid and ask price of the market.',
            parameters: {}
        };
    }

    static instance(params){
        return new BidAsk(params);
    }

    constructor({chart, state}){
        super({chart, panel: chart.center()});

        this.chart.special.push(Object.assign({action: this.toggle.bind(this)}, BidAsk.describe()));

        this.element.classed('bid-ask', true).classed('hide', true);

        this.bid = this.element.append('g').attr('class', 'bid');
        this.ask = this.element.append('g').attr('class', 'ask');

        this.bid.append('path');
        this.bid.append('text').attr('alignment-baseline', 'hanging').attr('text-anchor', 'end').attr('y', 6).text('Hello World');

        this.ask.append('path');
        this.ask.append('text').attr('alignment-baseline', 'baseline').attr('text-anchor', 'end').attr('y', -6).text('Hello World');

        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));
        this.disposables.add(this.panel.onDidRender(this.render.bind(this)));
        this.disposables.add(this.chart.onDidChangeMarket(this.subscribe.bind(this)));

        this.panel.add(this);
    }

    subscribe(){
        if(this.visible){
            if(this.subscription){
                this.subscription.dispose();
                this.subscription = null;
            }

            if(this.chart.market){
                this.subscription = this.chart.market.quotes.subscribe(this.render.bind(this));
            }
        }
    }

    serialize(){
        return {
            name: 'bid-ask',
            visible: this.visible
        };
    }

    toggle(){
        this.visible = !this.visible;
        this.panel.render();

        if(this.visible){
            this.subscribe();
        }else if(this.subscription){
            this.subscription.dispose();
            this.subscription = null;
        }
    }

    resize(){
        this.element.selectAll('path').attr('d', `M 0 0 h ${this.panel.width}`);
        this.element.selectAll('text').attr('x', this.panel.width - 6);
    }

    title(){
        return this.visible ? `Bid & Ask` : '';
    }

    value(){
        if(this.chart.market){
            const {bid, ask} = this.chart.market.quotes.last();

            return $.div({classList: 'value'},
                $.span({classList: 'first up'}, via.fn.number.formatPrice(bid.price, this.chart.market)),
                $.span({classList: 'down'}, via.fn.number.formatPrice(ask.price, this.chart.market))
            );
        }

        return $.div({classList: 'value'}, $.span({classList: 'first unavailable'}, '-'), $.span({classList: 'unavailable'}, '-'));
    }

    render(){
        if(this.visible){
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
        }else{
            this.element.classed('hide', true);
        }
    }

    remove(){
        this.toggle();
    }

    destroy(){
        if(this.subscription){
            this.subscription.dispose();
        }

        this.disposables.dispose();
    }
}
