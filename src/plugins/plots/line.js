const {CompositeDisposable, Disposable} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');

class Line {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;

        //TODO customize these properties
        this.property = 'close';

        this.element.classed('line', true);

        this.stroke = this.stroke.bind(this);
    }

    serialize(){
        return {
            version: 1,
            name: 'line'
        };
    }

    domain(){
        let [start, end] = this.chart.scale.domain();
        let data = this.chart.data.fetch({start, end}).sort((a, b) => a.date - b.date);

        if(data.length){
            return [ _.min(data.map(d => d.low)), _.max(data.map(d => d.high)) ];
        }
    }

    draw(){
        let [start, end] = this.chart.scale.domain();

        start.setTime(start.getTime() - this.chart.granularity);
        end.setTime(end.getTime() + this.chart.granularity);

        let data = this.chart.data.fetch({start, end}).sort((a, b) => a.date - b.date);

        this.element.selectAll('path').remove();
        this.element.append('path').classed('stroke', true).datum(data).attr('d', this.stroke);
    }

    stroke(data){
        if(data.length < 2){
            return '';
        }

        return 'M ' + data.map(d => this.chart.scale(d.date) + ' ' + this.panel.scale(d.close)).join(' L ');
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'line',
    type: 'plot',
    settings: {},
    title: 'Line Chart',
    description: 'Plot a solid line.',
    instance: params => new Line(params)
};
