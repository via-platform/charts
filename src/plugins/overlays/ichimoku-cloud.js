const {CompositeDisposable, Disposable} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');

class IchimokuCloud {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;

        //TODO customize these properties
        this.stroke = 1.5;
        this.property = 'close';
        this.length = 20;

        this.element.classed('ichimoku-cloud', true);

        this.upper = d3.line()
            .x(d => this.chart.scale(d.date))
            .y(d => this.panel.scale(d.upper));

        this.middle = d3.line()
            .x(d => this.chart.scale(d.date))
            .y(d => this.panel.scale(d.middle));

        this.lower = d3.line()
            .x(d => this.chart.scale(d.date))
            .y(d => this.panel.scale(d.lower));

        this.upper = this.upper.bind(this);
        this.middle = this.middle.bind(this);
        this.lower = this.lower.bind(this);
    }

    serialize(){
        return {
            version: 1,
            name: 'ichimoku-cloud'
        };
    }

    cloud(data){
        const elements = data.map(d => d[this.property]);
        const mean = d3.mean(elements);
        const deviation = d3.deviation(elements) || 0;

        return {
            date: _.last(data).date,
            upper: mean + 2 * deviation,
            middle: mean,
            lower: mean - 2 * deviation
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
        let bands = [];

        for(let i = 0; i < data.length; i++){
            bands.push(this.bollinger(data.slice(Math.max(0, i - this.length), i + 1)));
        }

        this.element.selectAll('path').remove();

        this.element.append('path')
            .datum(bands.slice(0, this.length - 1))
            .attr('class', 'bollinger-band upper incomplete')
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', this.stroke)
            .attr('d', this.upper);

        this.element.append('path')
            .datum(bands.slice(this.length - 2))
            .attr('class', 'bollinger-band upper')
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', this.stroke)
            .attr('d', this.upper);

        this.element.append('path')
            .datum(bands.slice(0, this.length - 1))
            .attr('class', 'bollinger-band middle incomplete')
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', this.stroke)
            .attr('d', this.middle);

        this.element.append('path')
            .datum(bands.slice(this.length - 2))
            .attr('class', 'bollinger-band middle')
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', this.stroke)
            .attr('d', this.middle);

        this.element.append('path')
            .datum(bands.slice(0, this.length - 1))
            .attr('class', 'bollinger-band lower incomplete')
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', this.stroke)
            .attr('d', this.lower);

        this.element.append('path')
            .datum(bands.slice(this.length - 2))
            .attr('class', 'bollinger-band lower')
            .attr('fill', 'none')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', this.stroke)
            .attr('d', this.lower);
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'ichimoku-cloud',
    type: 'overlay',
    settings: {},
    instance: params => new IchimokuCloud(params)
};
