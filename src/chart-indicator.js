//This file contains the base functionality shared by all indicators. It extends basic
//functionality shared by all layers. When a new ChartIndicator is created, it is initialized
//with a set of ChartPlots and parameters that are defined by the plugin configuration.

const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const ChartLayer = require('./chart-layer');
const ChartPlot = require('./chart-plot');

module.exports = class ChartIndicator extends ChartLayer {
    constructor({chart, state, plugin, panel}){
        super({chart, panel});

        this.plugin = plugin;
        this.panel = panel ? panel : plugin.params.panel ? this.chart.panel() : this.chart.center();
        this.element.classed(plugin.name, true).classed('selectable', plugin.selectable);

        //TODO There is one more thing that may force a recalculation - when the user changes a parameter
        this.disposables.add(this.chart.data.onDidUpdateData(this.calculate.bind(this)));
        // this.disposables.add(this.chart.onDidZoom(this.rescale.bind(this)));

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

    rescale(){
        const min = [];
        const max = [];

        for(const plot of Object.values(this.components)){
            const domain = plot.domain();

            if(domain.length){
                min.push(domain[0]);
                max.push(domain[1]);
            }
        }

        if(min.length){
            const low = Math.min(...min);
            const high = Math.max(...max);

            console.log(low, high)

            this.domain = [low, high];
            // this.decimals = high.toFixed(this.plugin.decimals ? this.plugin.decimals(this.chart) : 0).length;
        }else{
            this.domain = [];
            // this.decimals = 0;
        }
    }

    get decimals(){
        return this.plugin.decimals ? this.plugin.decimals(this.chart) : 0;
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
        for(const {plot, data} of Object.values(this.components)){
            plot.render(data);
        }
    }
}