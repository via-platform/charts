module.exports = class Line {
    constructor({chart, panel, element}){
        this.chart = chart;
        this.panel = panel;
        this.line = element.append('path').classed('stroke', true);
    }

    draw(series, properties){
        //TODO handle properties like color / width
        this.line.datum(series).attr('d', this.stroke.bind(this));
    }

    stroke(data){
        return data.length > 1 ? 'M' + data.map(([x, y]) => `${this.chart.scale(x)} ${this.panel.scale(y)}`).join(' L ') : '';
    }
}