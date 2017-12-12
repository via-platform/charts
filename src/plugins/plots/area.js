const {CompositeDisposable, Disposable} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');

class Area {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;

        //TODO customize these properties
        this.property = 'close';

        this.element.classed('area', true);

        this.stroke = this.stroke.bind(this);
        this.fill = this.fill.bind(this);
    }

    serialize(){
        return {
            version: 1,
            name: 'area'
        };
    }

    domain(){
        let [start, end] = this.chart.scale.domain();
        let data = this.chart.data.fetch({start, end});

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
        this.element.append('path').classed('fill', true).datum(data).attr('d', this.fill);
    }

    stroke(data){
        if(data.length < 2){
            return '';
        }

        return 'M ' + data.map(d => this.chart.scale(d.date) + ' ' + this.panel.scale(d.close)).join(' L ');
    }

    fill(data){
        if(data.length < 2){
            return '';
        }

        const first = _.first(data);
        const last = _.last(data);
        const [top, bottom] = this.panel.scale.range();

        return 'M ' + data.map(d => this.chart.scale(d.date) + ' ' + this.panel.scale(d.close)).join(' L ') + ' V ' + bottom + ' H ' + this.chart.scale(first.date);
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'area',
    type: 'plot',
    settings: {},
    title: 'Area Chart',
    description: 'Plot a solid shape.',
    instance: params => new Area(params)
};
