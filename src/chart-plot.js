const _ = require('underscore-plus');
const ChartStyles = require('./chart-styles');

const Plots = {
    'plot': require('./plots/plot'),
    'hl': require('./plots/hl'),
    'vl': require('./plots/vl'),
    'hr': require('./plots/hr'),
    'vr': require('./plots/vr'),
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
    constructor({chart, panel, layer, component, state}){
        this.chart = chart;
        this.panel = panel;
        this.layer = layer;
        this.component = component;
        this.parameters = {}; //Parameter ID => Plot Style Metadata
        this.element = this.layer.element.append('g').attr('class', this.component.type);
        this.plot = Plots[this.component.type];

        this.initialize(state);
    }

    initialize(state = {}){
        //TODO this is going to be wrong because state will only carry actual values
        //TODO set up an initialization function that checks state values against conditions
        for(const [identifier, definition] of Object.entries(ChartStyles[this.component.type])){
            this.parameters[identifier] = Object.assign({value: _.isUndefined(state[identifier]) ? definition.default : state[identifier]}, definition);
        }
    }

    valid(parameter, value){
        if(parameter.enum){
            return (typeof _.first(parameter.enum) === 'object') ? parameter.enum.map(v => v.value).includes(value) : parameter.enum.includes(value);
        }

        if(parameter.constraint){
            return parameter.constraint(value);
        }

        //TODO Check the actual type of the value against the type of the parameter
        return true;
    }

    render(){
        //TODO If selected, render the actual points, flags, and ranges
        this.plot({
            chart: this.chart,
            panel: this.panel,
            element: this.element,
            data: this.data,
            options: this.options,
            selected: this.layer.selected,
            component: this.component,
            parameters: this.parameters
        });
    }

    update(series, options = {}){
        this.data = Array.from(series);
        this.options = options;
    }

    destroy(){
        this.element.remove();
    }
}