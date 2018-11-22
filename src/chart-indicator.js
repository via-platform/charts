//This file contains the base functionality shared by all indicators. It extends basic
//functionality shared by all layers. When a new ChartIndicator is created, it is initialized
//with a set of ChartPlots and parameters that are defined by the plugin configuration.

const {CompositeDisposable, Disposable, d3, etch} = require('via');
const _ = require('underscore-plus');
const ChartLayer = require('./chart-layer');
const ChartPlot = require('./chart-plot');
const $ = etch.dom;

module.exports = class ChartIndicator extends ChartLayer {
    constructor({chart, state, plugin, panel}){
        super({chart, panel});

        this.plugin = plugin;
        this.panel = panel ? panel : plugin.params.panel ? this.chart.panel() : this.chart.center();
        this.element.classed(plugin.name, true).classed('selectable', plugin.selectable);

        this.initialize(state);
    }

    initialize(state = {}){
        this.parameters = {}; //Parameter ID => Value
        this.components = {};

        for(const [identifier, definition] of Object.entries(this.plugin.parameters)){
            //First set this parameter to the default value.
            this.parameters[identifier] = definition.default;

            //Then override the defaults with the user's saved state.
            if(state.parameters && state.parameters[identifier] && this.valid(definition, state.parameters[identifier])){
                this.parameters[identifier] = state.parameters[identifier];
            }
        }

        for(const [identifier, component] of Object.entries(this.plugin.components)){
            this.components[identifier] = new ChartPlot({
                chart: this.chart,
                panel: this.panel,
                layer: this,
                component,
                state: state.components ? state.components[identifier] : undefined
            });
        }
    }

    serialize(){
        const components = {};

        for(const [identifier, component] of Object.entries(this.components)){
            components[identifier] = component.plot.parameters;
        }

        return {parameters: this.parameters, components};
    }

    get decimals(){
        return this.plugin.decimals ? this.plugin.decimals(this.chart) : 0;
    }

    get domain(){
        const min = [];
        const max = [];

        for(const plot of Object.values(this.components)){
            const [low, high] = plot.domain;

            if(_.isNumber(low) && !_.isNaN(low)){
                min.push(low);
                max.push(high);
            }
        }

        if(min.length){
            const low = Math.min(...min);
            const high = Math.max(...max);

            return [low, high];
        }else{
            return [];
        }
    }

    draw(identifier, data, options = {}){
        if(this.components.hasOwnProperty(identifier)){
            this.components[identifier].update(data, options);
        }else{
            throw new Error(`Invalid component identifier. '${identifier}' does not match any of the predefined components.`);
        }
    }

    recalculate(){
        this.plugin.calculate({draw: this.draw.bind(this), parameters: this.parameters, series: this.chart.data.all()});
    }

    render(){
        //TODO If selected, render the actual points, flags, and ranges
        this.element.classed('selected', this.selected);

        for(const plot of Object.values(this.components)){
            plot.render();
        }
    }

    title(){
        const title = this.plugin.abbreviation ? this.plugin.abbreviation : this.plugin.title;
        const parameters = [];

        for(const [parameter, value] of Object.entries(this.parameters)){
            if(this.plugin.parameters[parameter].legend){
                parameters.push(value);
            }
        }

        return title + (parameters.length ? ` (${parameters.join(', ')})` : '');
    }

    value(band){
        const values = [];

        for(const plot of Object.values(this.components)){
            const value = plot.value(band, this.plugin.decimals ? this.plugin.decimals(this.chart) : 0);

            if(value){
                values.push(value);
            }
        }

        return values.length ? $.div({}, values) : '';
    }

    customize(){
        //Each layer is made up of parameters, plus one or more plugins' parameters
        //The main indicator's parameters will make up the root options
        //After that, there will be one or more groups, one for each plot

        const fields = Object.entries(this.plugin.parameters).map(([name, value]) => Object.assign({name}, value));
        const values = Object.assign({}, this.parameters);

        for(const [name, {component, plot, parameters}] of Object.entries(this.components)){
            const group = {
                title: component.title,
                type: 'group',
                fields: Object.entries(plot.parameters).map(([key, value]) => Object.assign({name: `${name}.${key}`}, value))
            };

            fields.push(group);

            for(const [key, value] of Object.entries(parameters)){
                values[`${name}.${key}`] = value;
            }
        }

        via.modal.configuration({title: `Configure ${this.title()}`, confirmText: 'Done'}, fields, values)
        .then(modal => {
            modal.on('did-change-value', ({field, value}) => {
                if(field.indexOf('.') === -1){
                    //We've updated a main parameter
                    this.parameters[field] = value;
                    this.chart.recalculate();
                }else{
                    //We've updated a parameter for one of our components
                    const [component, parameter] = field.split('.');

                    this.components[component].parameters[parameter] = value;

                    //We only need to render the single plot, not the whole indicator
                    this.components[component].render();
                }
            });
        });
    }
}
