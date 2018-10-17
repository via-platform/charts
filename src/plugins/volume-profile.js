const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

module.exports = class VolumeProfile {
    static metadata(){
        return {
            name: 'volume-profile',
            type: 'indicator',
            title: 'Volume Profile',
            description: 'Displays horizontal bars on the indicating volume bought and sold at each price level.',
            components: {},
            params: {
                location: {
                    title: 'Location',
                    type: 'string',
                    enum: ['left', 'right'],
                    default: 'right'
                },
                buy: {
                    title: 'Buy Color',
                    type: 'color',
                    default: '#00FF00'
                },
                sell: {
                    title: 'Sell Color',
                    type: 'color',
                    default: '#FF0000'
                },
                width: {
                    title: 'Width %',
                    type: 'number',
                    constraint: x => (x >= 1 && x <= 100),
                    default: 30
                }
            }
        };
    }

    constructor({chart, panel, layer, element}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.layer = layer;
        this.element = element;

        //We need to create a new horizontal scale, but not a new vertical scale
        //The vertical scale is just the panel scale
        this.scale = d3.scaleLinear().domain([100, 0]);

        this.element.classed('volume-profile', true).classed('hide', true);

        this.disposables.add(this.panel.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));

        this.resize();
    }

    subscribe(){
        if(this.subscription){
            this.subscription.dispose();
            this.subscription = null;
        }
    }

    resize(){
        this.scale.range([0, this.panel.width / 3]);
    }

    title(){
        return `Volume Profile`;
    }

    value(band){
        const candle = _.first(this.chart.data.fetch({start: band, end: band}));

        if(this.chart.market && candle){
            return $.div({classList: 'value'},
                'Buy',
                $.span({classList: 'up'}, candle.volume_buy.toFixed(this.chart.precision)),
                'Sell',
                $.span({classList: 'down'}, candle.volume_sell.toFixed(this.chart.precision))
            );
        }

        return $.div({classList: 'value'}, $.span({classList: 'first unavailable'}, '-'), $.span({classList: 'unavailable'}, '-'));
    }

    draw(){
        const [start, end] = this.chart.scale.domain();
        const data = this.chart.data.fetch({start, end}).filter(candle => candle.profile);

        if(data.length === 0){
            return this.element.classed('hide', true);
        }

        this.element.classed('hide', false);

        const profile_increment = _.max(data.map(candle => candle.profile_increment));
        const levels = new Map();

        for(const candle of data){
            for(const [level, buy, sell] of candle.profile){
                const rounded = this.coerce(level, profile_increment);
                const existing = levels.get(rounded);

                if(existing){
                    existing.buy += buy;
                    existing.sell += sell;
                    existing.total = existing.buy + existing.sell;
                }else{
                    levels.set(rounded, {level: rounded, buy, sell, total: buy + sell})
                }
            }
        }

        const values = Array.from(levels.values());
        const max = _.max(values.map(level => level.total));
        const height = Math.floor(this.panel.height * 0.9 / values.length * 0.8);

        this.scale.domain([0, max]);

        const volume_bar = this.element.selectAll('g').data(values, d => d.level);

        volume_bar.select('rect.volume-bar.sell')
            .attr('width', d => this.scale(d.sell))
            .attr('height', height)
            .attr('x', d => this.panel.width - this.scale(d.sell))
            .attr('y', d => Math.floor(this.panel.scale(d.level)));

        volume_bar.select('rect.volume-bar.buy')
            .attr('width', d => this.scale(d.buy))
            .attr('height', height)
            .attr('y', d => Math.floor(this.panel.scale(d.level)))
            .attr('x', d => this.panel.width - this.scale(d.buy) - this.scale(d.sell));

        const volume_bar_enter = volume_bar.enter().append('g');

        volume_bar_enter.append('rect')
            .attr('class', 'volume-bar sell')
            .attr('height', height)
            .attr('width', d => this.scale(d.sell))
            .attr('x', d => this.panel.width - this.scale(d.sell))
            .attr('y', d => Math.floor(this.panel.scale(d.level)));

        volume_bar_enter.append('rect')
            .attr('class', 'volume-bar buy')
            .attr('height', height)
            .attr('width', d => this.scale(d.buy))
            .attr('x', d => this.panel.width - this.scale(d.buy) - this.scale(d.sell))
            .attr('y', d => Math.floor(this.panel.scale(d.level)));

        volume_bar.exit().remove();
    }

    coerce(value, profile_increment){
        return Math.floor(value / profile_increment) * profile_increment;
    }

    destroy(){
        if(this.subscription){
            this.subscription.dispose();
        }

        this.disposables.dispose();
    }
}
