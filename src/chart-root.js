//This file contains the base functionality for the root plot.

const {CompositeDisposable, Disposable, d3, VS} = require('via');
const _ = require('underscore-plus');
const ChartLayer = require('./chart-layer');

module.exports = class ChartRoot extends ChartLayer {
    serialize(){
        return {
            type: this.type,
            parameters: this.parameters
        };
    }

    constructor({chart, panel, state}){
        super({chart, panel, plugin: {selectable: true}});

        //TODO There is one more thing that may force a recalculation - when the user changes a parameter
        // this.disposables.add(this.chart.data.onDidUpdateData(this.calculate.bind(this)));

        this.initialize(state);
    }

    initialize(state = {}){
        this.parameters = {};

        //We need to store information about the user's parameters for each chart type.
        //This way, if they switch from line to area and back, their line preferences are retained.
        for(const type of this.chart.manager.types){
            this.parameters[type.name] = {};

            //First set the defaults for each chart type.
            for(const [identifier, definition] of Object.entries(type.parameters)){
                this.parameters[type.name][identifier] = definition.default;
            }

            //Then override the defaults with the user's saved state.
            if(state.parameters && state.parameters[type.name]){
                for(const [parameter, value] of Object.entries(state.parameters[type.name])){
                    if(this.valid(type.parameters[parameter], value)){
                        this.parameters[type.name][parameter] = value;
                    }
                }
            }
        }

        const type = state.type ? state.type : via.config.get('charts.defaultChartType');
        const plugin = this.chart.manager.types.find(plugin => plugin.name === type);

        this.change(plugin);
    }

    change(type){
        if(this.type === type){
            return void via.console.log(`Did not change chart type. You are already looking at a ${type.title.toLowerCase()} chart.`);
        }

        this.type = type;
        this.element.attr('class', `layer ${type.name}`).selectAll('*').remove();
        this.calculate();

        this.emitter.emit('did-change-type', this.type);
    }

    valid(parameter, value){
        if(!parameter){
            return false;
        }

        if(parameter.enum){
            return (typeof _.first(parameter.enum) === 'object') ? parameter.enum.map(v => v.value).includes(value) : parameter.enum.includes(value);
        }

        if(parameter.constraint){
            return parameter.constraint(value);
        }

        //TODO Check the actual type of the value against the type of the parameter
        return true;
    }

    calculate(){
        this.data = this.chart.data.all();

        if(this.type.calculate){
            this.data = this.type.calculate({series: this.data, parameters: this.parameters[this.type.name]});
        }
    }

    render(){
        //TODO If selected, render the actual points, flags, and ranges
        //TODO Trim this.data to only render the visible datapoints
        if(this.type){
            this.type.render({
                chart: this.chart,
                panel: this.panel,
                element: this.element,
                data: this.data,
                selected: this.selected,
                parameters: this.parameters[this.type.name]
            });
        }
    }

    get decimals(){
        return this.chart.market ? this.chart.market.precision.price : 0;
    }

    onDidChangeType(callback){
        return this.emitter.on('did-change-type', callback);
    }
}