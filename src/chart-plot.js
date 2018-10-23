const _ = require('underscore-plus');
const {is_series} = require('via').VS;

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

        //First we initialize the plot defaults
        for(const [identifier, value] of Object.entries(this.plot.parameters)){
            this.parameters[identifier] = value.default;
        }

        //Then we override them with the component defaults
        if(this.component.parameters){
            for(const [identifier, value] of Object.entries(this.component.parameters)){
                if(this.plot.parameters.hasOwnProperty(identifier) && this.valid(this.plot.parameters[identifier], value)){
                    this.parameters[identifier] = value;
                }
            }
        }

        //Then we override them further with the saved state params
        //We also have to check and make sure that the state param is (still) valid for the plot, in case
        //of a bad state save, or a change in the plot definition.
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

        //TODO Coerce color types for validity
        //TODO Check the actual type of the value against the type of the parameter
        return true;
    }

    update(data, options){
        this.data = data;
        this.options = options;
    }

    render(){
        if(this.plot){
            const [start, end] = this.chart.scale.domain();

            this.plot.render({
                chart: this.chart,
                panel: this.panel,
                element: this.element,
                data: this.data.range(start, end),
                options: this.options,
                selected: this.layer.selected,
                component: this.component,
                parameters: this.parameters
            });
        }
    }

    domain(){
        if(this.data){
            const [start, end] = this.chart.scale.domain();

            if(is_series(this.data)){
                const range = this.data.range(start, end);

                if(range.length){
                    return [range.min(), range.max()];
                }
            }else{
                return [data, data];
            }
        }

        return [];
    }

    destroy(){
        this.element.remove();
    }
}