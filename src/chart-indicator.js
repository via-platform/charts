//This file contains the base functionality shared by all indicators. It extends basic
//functionality shared by all layers. When a new ChartIndicator is created, it is initialized
//with a set of ChartPlots and parameters that are defined by the plugin configuration.

const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const ChartLayer = require('./chart-layer');
const ChartPlot = require('./chart-plot');

module.exports = class ChartIndicator extends ChartLayer {
    constructor({chart, state, plugin, panel}){
        super({chart, panel, plugin});
        this.components = new Map(); //Component ID => Plot
        this.parameters = {}; //Parameter ID => Plugin parameter metadata (e.g. length)
        this.panel = panel ? panel : plugin.params.panel ? this.chart.panel() : this.chart.center();
        this.element.classed(plugin.name, true);

        //TODO There is one more thing that may force a recalculation - when the user changes a parameter
        this.disposables.add(this.chart.data.onDidUpdateData(this.calculate.bind(this)));

        this.initialize(state);
    }

    initialize({components, parameters} = {}){
        for(const [identifier, definition] of Object.entries(this.plugin.parameters)){
            this.parameters[identifier] = Object.assign({value: parameters ? parameters[identifier] : definition.default}, definition);
        }

        for(const [identifier, component] of Object.entries(this.plugin.components)){
            this.components.set(identifier, new ChartPlot({
                chart: this.chart,
                panel: this.panel,
                layer: this,
                component,
                state: components ? components[identifier] : undefined
            }));
        }
    }

    draw(identifier, series, options = {}){
        if(this.components.has(identifier)){
            this.components.get(identifier).update(series, options);
        }else{
            throw new Error(`Invalid component identifier. '${identifier}' does not match any of the predefined components.`);
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

    domain(){
        // return _.max(Array.from(this.components.values()).map(component => component.domain()));
    }

    calculate(){
        const parameters = {};

        for(const [key, definition] of Object.entries(this.parameters)){
            parameters[key] = definition.value;
        }

        this.plugin.calculate({
            draw: this.draw.bind(this),
            parameters,
            series: this.chart.data.all()
        });

        this.render();
    }

    render(){
        //TODO If selected, render the actual points, flags, and ranges
        for(const plot of this.components.values()){
            plot.render();
        }
    }
}