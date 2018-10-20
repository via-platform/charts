const _ = require('underscore-plus');

module.exports = class ChartPlot {
    constructor({chart, panel, layer, component, state}){
        this.chart = chart;
        this.panel = panel;
        this.layer = layer;
        this.component = component;
        this.element = this.layer.element.append('g').attr('class', this.component.type);
        this.plot = this.chart.manager.plots.find(plot => plot.name === this.component.type);

        this.initialize(state);
    }

    initialize(state = {}){
        this.parameters = {};

        for(const [identifier, value] of Object.entries(this.component.parameters)){
            if(this.plot.parameters.hasOwnProperty(identifier) && this.valid(this.plot.parameters[identifier], value)){
                this.parameters[identifier] = value;
            }
        }

        for(const [identifier, value] of Object.entries(state)){
            if(this.plot.parameters.hasOwnProperty(identifier) && this.valid(this.plot.parameters[identifier], value)){
                this.parameters[identifier] = value;
            }
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
        this.plot.render({
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

    update(data, options = {}){
        this.data = data;
        this.options = options;
    }

    destroy(){
        this.element.remove();
    }
}