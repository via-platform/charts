const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const VS = require('./chart-vs');
const etch = require('etch');
const ChartLayer = require('./chart-layer');
const ChartPlot = require('./chart-plot');
const $ = etch.dom;

module.exports = class ChartIndicator extends ChartLayer {
    constructor({chart, state, plugin, panel}){
        super({chart, panel, plugin});
        this.state = state;
        this.components = new Map(); //Component ID => Metadata
        this.plots = new Map(); //Component ID => Plot
        this.data = [];
        this.element.classed(plugin.name, true);

        //TODO this is going to be wrong because state will only carry actual values
        //TODO set up an initialization function that checks state values against conditions
        this.params = state ? _.defaults(state, plugin.params) : plugin.params;

        if(panel){
            this.panel = panel;
        }else{
            this.panel = plugin.params.panel ? this.chart.panel() : this.chart.center();
        }

        this.disposables.add(this.chart.data.onDidUpdateData(this.calculate.bind(this)));

        for(const [identifier, component] of Object.entries(this.plugin.components)){
            this.component(identifier, component);
        }
    }

    component(identifier, component){
        //Initialize a new component
        if(component.type === 'plot'){
            this.components.set(identifier, _.defaults(component, {
                enum: ['line', 'area', 'mountain', 'histogram'],
                default: 'line',
                stroke: '#FFF',
                fill: 'transparent'
            }));
        }
    }

    plot(identifier, series){
        if(this.components.has(identifier)){
            const params = this.components.get(identifier);
            const type = this.type(params);

            if(this.plots.has(identifier)){
                const plot = this.plots.get(identifier);

                if(plot.type === type){
                    return void plot.update(series);
                }else{
                    plot.destroy();
                }
            }

            this.plots.set(identifier, new ChartPlot({chart: this.chart, panel: this.panel, layer: this, type, params, series}));
        }
    }

    type(component){
        return component.type === 'plot' ? component.default : component.type;
    }

    domain(){
        // return _.max(Array.from(this.components.values()).map(component => component.domain()));
    }

    calculate(){
        const params = {};

        for(const [param, definition] of Object.entries(this.params)){
            params[param] = definition.value || definition.default;
        }

        this.plugin.calculate({chart: this.chart, panel: this.panel, plot: this.plot.bind(this), params, series: this.chart.data.all()});

        this.render();
    }

    render(){
        //TODO If selected, render the actual points, flags, and ranges
        for(const plot of this.plots.values()){
            plot.render();
        }
    }

    destroy(){
        // this.element.remove();
        this.disposables.dispose();
    }
}