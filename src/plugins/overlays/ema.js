const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class EMA {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;

        //TODO customize these properties
        this.stroke = 1.5;
        this.property = 'close';
        this.length = 12;
        this.values = [];

        this.element.classed('ema', true);

        this.line = d3.line()
            .x(d => this.chart.scale(d.time_period_start))
            .y(d => this.panel.scale(d.average));

        this.line = this.line.bind(this);
    }

    serialize(){
        return {
            version: 1,
            name: 'ema'
        };
    }

    draw(){
        let [start, end] = this.chart.scale.domain();

        if(this.length < 1){
            return;
        }

        start.setTime(start.getTime() - (this.length + 1) * this.chart.granularity);
        end.setTime(end.getTime() + this.chart.granularity);

        this.values = this.chart.data.fetch({start, end}).sort((a, b) => a.time_period_start - b.time_period_start);

        for(let i = 0; i < this.length - 1 && i < this.values.length; i++){
            let total = 0;

            for(let j = 0; j <= i; j++){
                total += this.values[j][this.property];
            }

            this.values[i].average = total / (i + 1);
        }

        for(let i = this.length - 1; i < this.values.length; i++){
            let total = 0;

            for(let j = i - this.length + 1; j <= i; j++){
                total += this.values[j][this.property];
            }

            this.values[i].average = total / this.length;
        }

        this.element.selectAll('path').remove();

        this.element.append('path')
            .datum(this.values.slice(0, this.length - 1))
            .classed('incomplete', true)
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', this.stroke)
            .attr('d', this.line);

        this.element.append('path')
            .datum(this.values.slice(this.length - 2))
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', this.stroke)
            .attr('d', this.line);
    }

    title(){
        return `EMA (${this.length})`;
    }

    value(band){
        const candle = this.values.find(value => value.time_period_start.getTime() === band.getTime());
        const precision = this.chart.market ? this.chart.market.precision.price : 0;

        return $.div({classList: 'value'},
            $.span({classList: candle ? 'available' : 'unavailable'}, candle ? candle.average.toFixed(precision) : '-')
        );
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'ema',
    type: 'overlay',
    settings: {},
    title: 'Exponential Moving Average',
    description: 'An n-period exponential moving average.',
    instance: params => new EMA(params)
};
