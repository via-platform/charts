const Plots = {
    'candle': require('./plots/candle'),
    'line': require('./plots/line'),
    'bar': require('./plots/bar'),
    'area': require('./plots/area'),
    'mountain': require('./plots/mountain'),
    'heikin-ashi': require('./plots/heikin-ashi'),
    'histogram': require('./plots/histogram'),
    'step': require('./plots/step'),
    'cross': require('./plots/cross'),
    'column': require('./plots/column'),
    'circle': require('./plots/circle')
};

module.exports = class ChartPlot {
    constructor({chart, panel, layer, series, params, type}){
        this.chart = chart;
        this.layer = layer;
        this.series = series;
        this.panel = panel;
        this.params = params;
        this.type = type;
        this.plot = Plots[this.type];
        this.element = this.layer.element.append('g').attr('class', this.type);
    }

    render(){
        //TODO If selected, render the actual points, flags, and ranges
        this.plot({chart: this.chart, panel: this.panel, element: this.element, series: Array.from(this.series), params: this.params});
    }

    update(series){
        this.series = series;
    }

    destroy(){
        this.element.remove();
    }
}