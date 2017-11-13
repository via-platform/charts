const {CompositeDisposable, Disposable} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');

class SMA {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;

        //TODO customize these properties
        this.stroke = 1.5;
        this.property = 'close';
        this.length = 15;

        this.element.classed('sma', true);

        this.line = d3.line()
            .x(d => this.chart.scale(d.date))
            .y(d => this.panel.scale(d.average));

        this.line = this.line.bind(this);
    }

    serialize(){
        return {
            version: 1,
            name: 'sma'
        };
    }

    draw(){
        let [start, end] = this.chart.scale.domain();

        if(this.length < 1){
            return;
        }

        start.setTime(start.getTime() - (this.length + 1) * this.chart.granularity);
        end.setTime(end.getTime() + this.chart.granularity);

        let data = this.chart.data.fetch({start, end}).sort((a, b) => a.date - b.date);
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

        this.element.selectAll('path').remove();

        this.element.append('path')
            .datum(data.slice(0, this.length - 1))
            .classed('incomplete', true)
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', this.stroke)
            .attr('d', this.line);

        this.element.append('path')
            .datum(data.slice(this.length - 2))
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', this.stroke)
            .attr('d', this.line);
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'sma',
    type: 'overlay',
    settings: {},
    instance: params => new SMA(params)
};
