const {Disposable, CompositeDisposable, Emitter} = require('via');
const _ = require('underscore-plus');

module.exports = class ChartLayer {
    static deserialize({chart, panel, state}){
        const plugin = chart.plugins.get(state.plugin.name);

        return new ChartLayer({chart, panel, plugin, isRoot: state.isRoot, pluginState: state.plugin});
    }

    serialize(){
        return {
            isRoot: this.isRoot,
            plugin: this.plugin.serialize()
        };
    }

    constructor({chart, panel, isRoot, plugin, pluginState}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.isRoot = isRoot;
        this.element = this.panel.svg.append('g').classed('layer', true).classed('root', isRoot);
        this.plugin = plugin.instance({chart, panel, state: pluginState, element: this.element});
        this.draw();

        if(this.isRoot && this.panel.isCenter){
            this.disposables.add(this.chart.onDidChangeType(this.changePlugin.bind(this)));
        }
    }

    changePlugin(plugin){
        if(this.plugin){
            this.plugin.destroy();
        }

        if(this.element){
            this.element.remove();
            this.element = null;
        }

        this.element = this.panel.svg.append('g').classed('layer', true).classed('root', this.isRoot);
        this.plugin = plugin.instance({chart: this.chart, panel: this.panel, element: this.element});
        this.panel.didModifyLayer(this);
        this.draw();
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

    draw(){
        if(this.plugin){
            this.plugin.draw();
        }
    }

    remove(){
        if(this.panel.isCenter && this.isRoot){
            return;
        }

        this.panel.removeLayer(this);
    }

    destroy(){
        this.element.remove();
        this.disposables.dispose();
        this.plugin.destroy();
    }
}
