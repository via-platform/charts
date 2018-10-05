const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');

class MACD {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;
        this.padding = 0.4;

        this.element.classed('macd', true);

        this.body = this.body.bind(this);
    }

    serialize(){
        return {
            version: 1,
            name: 'MACD'
        };
    }

    domain(){
        return [-1, 1];
    }

    draw(){
        let [start, end] = this.chart.scale.domain();

        if(this.length < 1){
            return;
        }

        start.setTime(start.getTime() - (this.length + 1) * this.chart.granularity);
        end.setTime(end.getTime() + this.chart.granularity);

        let data = this.chart.data.fetch({start, end}).sort((a, b) => a.time_period_start - b.time_period_start);
        // let incomplete = data.slice(0, this.length - 1);
        // let complete = data.slice(this.length - 1);

        for(let i = 0; i < this.length - 1 && i < data.length; i++){
            let total = 0;

            for(let j = 0; j <= i; j++){
                total += data[j][this.property];
            }

            data[i].average = total / (i + 1);
        }

        for(let i = this.length - 1; i < data.length; i++){
            let total = 0;

            for(let j = i - this.length + 1; j <= i; j++){
                total += data[j][this.property];
            }

            data[i].average = total / this.length;
        }











        let [start, end] = this.chart.scale.domain();
        let data = this.chart.data.fetch({start, end});

        let body = this.element.selectAll('path')
            .data(data, d => d.time_period_start.getTime())
            .attr('class', d => (d.price_open > d.price_close) ? 'down' : 'up')
            .attr('d', this.body);

        body.enter()
                .append('path')
                .attr('d', this.body)
                .attr('class', d => (d.price_open > d.price_close) ? 'down' : 'up');

        body.exit().remove();
    }

    body(d){
        let w = Math.min(this.chart.bandwidth - 2, Math.floor(this.chart.bandwidth * (1 - this.padding) - 1)),
            vol = this.panel.scale(d.volume),
            x = this.chart.scale(d.time_period_start) - w / 2,
            y = this.panel.scale(0);

        return `M ${x} ${vol} h ${w} V ${y} h ${-w} Z`;
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'MACD',
    type: 'indicator',
    settings: {},
    instance: params => new MACD(params)
};
