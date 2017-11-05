const _ = require('underscore-plus');

module.exports = class ChartLayer {
    static deserialize({chart, panel, state}){
        return new ChartLayer({chart, panel, isRoot: state.isRoot, plugin: state.plugin});
    }

    serialize(){
        return {
            isRoot: this.isRoot,
            plugin: this.plugin.serialize()
        };
    }

    constructor({chart, panel, isRoot, plugin}){
        this.chart = chart;
        this.panel = panel;
        this.isRoot = isRoot;
        this.element = this.panel.svg.append('g').classed('layer', true).classed('root', isRoot);
        this.plugin = this.chart.plugins.get(plugin.name).instance({chart, panel, state: plugin, element: this.element});
    }

    domain(){
        return (this.plugin && _.isFunction(this.plugin.domain)) ? this.plugin.domain() : [];
    }

    draw(){
        if(this.plugin){
            this.plugin.draw();
        }
    }
}
