const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class RSI {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;
        this.padding = 0.6;
        this.values = [];

        //TODO allow customization of these properties
        this.periods = 14;
        this.factor = 10;
        this.stroke = 1.5;
        this.lower = 30;
        this.upper = 70;

        this.element.classed('rsi', true);
        this.range = this.element.append('rect').classed('range', true).attr('x', 0);

        this.line = d3.line()
            .x(d => this.chart.scale(d.date))
            .y(d => this.panel.scale(d.value))
            .bind(this);
    }

    serialize(){
        return {
            version: 1,
            name: 'rsi'
        };
    }

    title(){
        return `RSI (${this.periods})`;
    }

    value(band){
        const data = this.values.find(period => period.date.getTime() === band.getTime());
        const value = data ? data.value.toFixed(4) : '-';

        return $.div({classList: 'value'},
            $.span({classList: 'available first'}, value)
        );
    }

    domain(){
        const [start, end] = this.chart.scale.domain();
        const data = this.values.filter(d => d.date >= start && d.date <= end);

        if(data.length){
            return d3.extent(data, d => d.value);
        }
    }

    draw(){
        const [start, end] = this.chart.scale.domain();
        start.setTime(start.getTime() - (this.chart.granularity * this.factor * this.periods));
        const data = this.chart.data.fetch({start, end}).sort((a, b) => a.date - b.date);

        if(data.length < this.periods){
            return;
        }

        this.values = [];

        data.reduce((accumulator, candle, index) => {
            const gain = Math.max(candle.close - candle.open, 0);
            const loss = Math.max(candle.open - candle.close, 0);
            let ag, al;

            if(index < this.periods - 1){
                return {gain: accumulator.gain + gain, loss: accumulator.loss + loss};
            }else if(index === this.periods - 1){
                ag = (accumulator.gain + gain) / this.periods;
                al = (accumulator.loss + loss) / this.periods;
            }else{
                ag = ((this.periods - 1) * accumulator.gain + gain) / this.periods;
                al = ((this.periods - 1) * accumulator.loss + loss) / this.periods;
            }

            this.values.push({date: new Date(candle.date), value: 100 - (100 / (1 + (ag / al)))});

            return {gain: ag, loss: al};
        }, {gain: 0, loss: 0});

        this.element.selectAll('path').remove();

        this.element.append('path')
            .datum(this.values)
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', this.stroke)
            .attr('d', this.line);

        this.element.append('path')
            .classed('range', true)
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('d', `M 0,${Math.round(this.panel.scale(this.upper)) - 0.5} h ${this.panel.width}`);

        this.element.append('path')
            .classed('range', true)
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('d', `M 0,${Math.round(this.panel.scale(this.lower)) - 0.5} h ${this.panel.width}`);

        this.range
            .attr('y', Math.round(this.panel.scale(this.upper)) - 0.5)
            .attr('width', this.panel.width)
            .attr('height', Math.round(this.panel.scale(this.lower) - this.panel.scale(this.upper)));
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'rsi',
    type: 'indicator',
    settings: {},
    title: 'Relative Strength Index',
    description: 'A momentum oscillator that measures the speed and change of price movements.',
    instance: params => new RSI(params)
};
