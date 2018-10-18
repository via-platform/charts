const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const VS = require('./chart-vs');
const etch = require('etch');
const ChartLayer = require('./chart-layer');
const $ = etch.dom;

module.exports = class ChartIndicator extends ChartLayer {
    constructor({chart, state, plugin, panel}){
        super({chart, panel, plugin});
        this.disposables = new CompositeDisposable();
        this.state = state;
        this.components = new Map(); //Component ID => Metadata
        this.data = [];
        this.params = {};

        if(panel){
            this.panel = panel;
        }else{
            this.panel = plugin.params.panel ? this.chart.panel() : this.chart.center();
        }

        this.disposables.add(this.chart.onDidUpdateData(this.calculate.bind(this)));

        for(const [identifier, component] of Object.entries(this.plugin.components)){
            this.component(identifier, component);
        }
    }

    component(identifier, component){
        //Initialize a new component
        if(compo)
        this.components.set(component, parameters);
    }

    plot(identifier, series){
        if(this.components.has(identifier)){

        }
    }

    domain(){
        return _.max(this.components.map(component => component.domain()));
    }

    calculate(series){
        this.data = this.plugin.calculate({chart: this.chart, panel: this.panel, params: this.params, plot: this.plot, series});
    }

    render(){
        //TODO If selected, render the actual points, flags, and ranges
        // this.element.classed('working', this.params.working).classed('done', this.params.done);
        // this.plugin.render({chart: this.chart, panel: this.panel, points: this.points, element: this.element, params: this.params});
        for(const component of components){
            //Render the actual plot
        }
    }

    destroy(){
        // this.element.remove();
        this.disposables.dispose();
    }
}