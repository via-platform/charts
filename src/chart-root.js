//This file contains the base functionality for the root plot.

const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const ChartLayer = require('./chart-layer');
const ChartPlot = require('./chart-plot');

module.exports = class ChartRoot extends ChartLayer {
    serialize(){
        return {
            type: this.type
        };
    }

    constructor({chart, panel, state}){
        super({chart, panel, plugin: {selectable: true}});

        this.parameters = {};
        this.type = '';

        this.change(state ? state.plot : via.config.get('charts.defaultChartType'));

        //TODO There is one more thing that may force a recalculation - when the user changes a parameter
        this.disposables.add(this.chart.data.onDidUpdateData(this.render.bind(this)));
    }

    change(type){
        if(this.type === type){
            return void via.console.log(`Did not change chart type. You are already looking at a ${type} chart.`);
        }

        this.type = type;
        this.element.classed(type, true).selectAll('*').remove();
        this.plot = this.chart.manager.plots.find(plot => plot.name === type);
        this.render();
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

    render(){
        //TODO If selected, render the actual points, flags, and ranges
        console.log('Rendering core', this.plot)

        if(this.plot){
            this.plot.render({
                chart: this.chart,
                panel: this.panel,
                element: this.element,
                data: this.chart.data.all(),
                options: this.options,
                selected: this.selected,
                component: this.component,
                parameters: this.parameters
            });
        }
    }

    onDidChangePlot(callback){
        return this.emitter.on('did-change-plot', callback);
    }
}