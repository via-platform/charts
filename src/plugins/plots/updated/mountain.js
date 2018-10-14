module.exports = class Mountain {
    constructor({chart, panel, element}){
        this.chart = chart;
        this.panel = panel;
        this.line = element.append('path').classed('stroke', true);
        this.area = element.append('path').classed('fill', true);
    }

    draw(series, properties){
        //TODO handle properties like color / width
        this.line.datum(series).attr('d', this.stroke.bind(this));
        this.area.datum(series).attr('d', this.fill.bind(this));
    }

    stroke(data){
        return data.length > 1 ? 'M' + data.map(([x, y]) => `${this.chart.scale(x)} ${this.panel.scale(y)}`).join(' L ') : '';
    }

    fill(data){
        return 'M ' + ' V ' + bottom + ' H ' + this.chart.scale(first.time_period_start);

        if(data.length > 1){
            const [start] = _.first(data);
            const [top, bottom] = this.panel.scale.range();
            const points = data.map(([x, y]) => `${this.chart.scale(x)} ${this.panel.scale(y)}`).join(' L ');

            return `M ${points} V ${bottom} H ${this.chart.scale(start)} Z`;
        }else{
            return '';
        }
    }
}