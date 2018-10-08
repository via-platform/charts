const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class Trades {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;
        this.padding = 0.6;
        this.buy = this.buy.bind(this);
        this.sell = this.sell.bind(this);

        this.element.classed('trades', true);
    }

    serialize(){
        return {
            version: 1,
            name: 'volume'
        };
    }

    title(){
        return `Number of Trades`;
    }

    value(band){
        const data = _.first(this.chart.data.fetch({start: band, end: band})) || {};

        return $.div({classList: 'value'},
            'Buys',
            $.span({classList: 'up'},
                (_.isUndefined(data) || _.isUndefined(data.buy_count)) ? '-' : data.buy_count
            ),
            'Sells',
            $.span({classList: 'down'},
                (_.isUndefined(data) || _.isUndefined(data.sell_count)) ? '-' : data.sell_count
            ),
            'Total',
            $.span({classList: 'available'},
                (_.isUndefined(data) || _.isUndefined(data.trades_count)) ? '-' : data.trades_count
            )
        );
    }

    domain(){
        const [start, end] = this.chart.scale.domain();
        const data = this.chart.data.fetch({start, end});

        if(data.length){
            return [0, d3.max(data, d => d.trades_count) * 1.2];
        }
    }

    draw(){
        const [start, end] = this.chart.scale.domain();
        const data = this.chart.data.fetch({start, end});

        this.width = Math.max(1, Math.min(this.chart.bandwidth - 2, Math.floor(this.chart.bandwidth * (1 - this.padding) - 1)));

        const volume_bar = this.element.selectAll('g').data(data, d => d.time_period_start.getTime());

        volume_bar.select('path.sell').attr('d', this.sell);
        volume_bar.select('path.buy').attr('d', this.buy);

        const volume_bar_enter = volume_bar.enter().append('g');

        volume_bar_enter.append('path').attr('class', 'sell').attr('d', this.sell);
        volume_bar_enter.append('path').attr('class', 'buy').attr('d', this.buy);

        volume_bar.exit().remove();
    }

    buy(d){
        const width = Math.max(1, Math.min(this.chart.bandwidth - 2, Math.floor(this.chart.bandwidth * (1 - this.padding) - 1)));
        const x = this.chart.scale(d.time_period_start) - this.width / 2;
        return `M ${x} ${this.panel.scale(d.sell_count + d.buy_count)} h ${this.width} V ${this.panel.scale(d.sell_count)} h ${-this.width} Z`;
    }

    sell(d){
        const x = this.chart.scale(d.time_period_start) - this.width / 2;
        return `M ${x} ${this.panel.scale(d.sell_count)} h ${this.width} V ${this.panel.scale(0)} h ${-this.width} Z`;
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'trades',
    type: 'indicator',
    settings: {},
    title: 'Number of Trades',
    description: 'A bar for each time period corresponding to the number of individual trades.',
    instance: params => new Trades(params)
};
