const {sma, prop} = require('via').VS;

module.exports = {
    name: 'volume',
    title: 'Trading Volume',
    description: 'A volume bar for each time period corresponding to the relative number of units traded.',
    panel: true,
    params: {
        property: {
            title: 'Property',
            type: 'string',
            enum: ['open', 'high', 'low', 'close', 'mid', 'average'],
            default: 'close'
        },
        length: {
            title: 'Length',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 15
        }
    },
    calculate: layer => {
        layer.plot(sma(prop(layer.param('property')), layer.param('length')));
    }
}





const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class Volume {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;
        this.padding = 0.6;
        this.buy = this.buy.bind(this);
        this.sell = this.sell.bind(this);

        this.element.classed('volume', true);
    }

    serialize(){
        return {
            version: 1,
            name: 'volume'
        };
    }

    title(){
        if(this.chart.market && this.chart.market.type === 'PERPETUAL'){
            return `Trading Volume (x${this.chart.market.contract_size})`;
        }

        return `Trading Volume`;
    }

    value(band){
        const data = _.first(this.chart.data.fetch({start: band, end: band})) || {};
        const aggregation = this.chart.market ? this.chart.market.precision.amount : 2;

        return $.div({classList: 'value'},
            'Bought',
            $.span({classList: 'up'},
                (_.isUndefined(data) || _.isUndefined(data.volume_buy)) ? '-' : via.fn.number.formatAmount(data.volume_buy, this.chart.market)
            ),
            'Sold',
            $.span({classList: 'down'},
                (_.isUndefined(data) || _.isUndefined(data.volume_sell)) ? '-' : via.fn.number.formatAmount(data.volume_sell, this.chart.market)
            ),
            'Total',
            $.span({classList: 'available'},
                (_.isUndefined(data) || _.isUndefined(data.volume_traded)) ? '-' : via.fn.number.formatAmount(data.volume_traded, this.chart.market)
            )
        );
    }

    domain(){
        const [start, end] = this.chart.scale.domain();
        const data = this.chart.data.fetch({start, end});

        if(data.length){
            return [0, _.max(data.map(d => d.volume_traded)) * 1.2];
        }
    }

    draw(){
        const [start, end] = this.chart.scale.domain();
        const data = this.chart.data.fetch({start, end});

        this.width = Math.max(1, Math.min(this.chart.bandwidth - 2, Math.floor(this.chart.bandwidth * (1 - this.padding) - 1)));

        const volume_bar = this.element.selectAll('g').data(data, d => d.time_period_start.getTime());

        volume_bar.select('path.volume-bar.sell').attr('d', this.sell);
        volume_bar.select('path.volume-bar.buy').attr('d', this.buy);

        const volume_bar_enter = volume_bar.enter().append('g');

        volume_bar_enter.append('path').attr('class', 'volume-bar sell').attr('d', this.sell);
        volume_bar_enter.append('path').attr('class', 'volume-bar buy').attr('d', this.buy);

        volume_bar.exit().remove();
    }

    buy(d){
        const width = Math.max(1, Math.min(this.chart.bandwidth - 2, Math.floor(this.chart.bandwidth * (1 - this.padding) - 1)));
        const x = this.chart.scale(d.time_period_start) - this.width / 2;
        return `M ${x} ${this.panel.scale(d.volume_sell + d.volume_buy)} h ${this.width} V ${this.panel.scale(d.volume_sell)} h ${-this.width} Z`;
    }

    sell(d){
        const x = this.chart.scale(d.time_period_start) - this.width / 2;
        return `M ${x} ${this.panel.scale(d.volume_sell)} h ${this.width} V ${this.panel.scale(0)} h ${-this.width} Z`;
    }

    destroy(){
        this.disposables.dispose();
    }
}

// module.exports = {
//     name: 'volume',
//     type: 'indicator',
//     settings: {},
//     title: 'Trading Volume',
//     description: 'A volume bar for each time period corresponding to the relative number of units traded.',
//     instance: params => new Volume(params)
// };
