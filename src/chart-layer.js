const {Disposable, CompositeDisposable, Emitter} = require('via');
const _ = require('underscore-plus');

module.exports = class ChartLayer {
    static deserialize({chart, panel, state}){
        const plugin = chart.plugins.get(state.plugin.name);

        return new ChartLayer({chart, panel, plugin, pluginState: state.plugin});
    }

    serialize(){
        return {
            plugin: this.plugin.serialize()
        };
    }

    constructor({chart, panel, plugin, params}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.selectable = false;
        this.priority = plugin.priority || 1;

        this.disposables.add(this.chart.onDidSelect(this.draw.bind(this)));
        this.disposables.add(this.chart.onDidUnselect(this.draw.bind(this)));

        this.initialize(plugin, params);
    }

    initialize(plugin, params){
        if(this.plugin){
            this.plugin.destroy();
        }

        if(this.element){
            this.element.remove();
            this.element = null;
        }

        this.element = this.panel.zoomable.append('g').datum(this.priority).classed('layer', true).classed('selectable', plugin.selectable);
        this.plugin = plugin.instance({chart: this.chart, panel: this.panel, element: this.element, layer: this, params});
        this.panel.sortLayers();
        this.panel.didModifyLayer(this);
        this.selectable = !!plugin.selectable;

        if(this.chart.selected === this && !this.selectable){
            this.chart.unselect();
        }

        this.draw();
    }

    select(){
        this.chart.select(this);
    }

    isSelected(){
        return this.chart.selected === this;
    }

    domain(){
        return (this.plugin && _.isFunction(this.plugin.domain)) ? this.plugin.domain() : [];
    }

    title(){
        return _.isFunction(this.plugin.title) ? this.plugin.title() : '';
    }

    value(candle){
        return _.isFunction(this.plugin.value) ? this.plugin.value(candle) : '';
    }

    plot(series, options = {}){
        
    }

    draw(){
        if(this.plugin){
            //TODO Draw the layer instead of recalculating things with the plugin
            // this.plugin.draw();
        }


    }

    remove(){
        if(this.chart.selected === this){
            this.chart.unselect();
        }

        this.panel.removeLayer(this);
    }

    async customize(){
        const modal = await via.modal.form({height: 200}, {});

        modal.on('did-change-value', data => {
            console.log(data);
        });
    }

    destroy(){
        this.element.remove();
        this.disposables.dispose();
        this.plugin.destroy();
    }
}
