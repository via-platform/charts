const {Disposable, CompositeDisposable, Emitter} = require('via');
const _ = require('underscore-plus');

module.exports = class ChartLayer {
    serialize(){
        return {
            plugin: this.plugin.serialize()
        };
    }

    constructor({chart, panel, plugin}){
        this.chart = chart;
        this.panel = panel;
        this.plugin = plugin;
        this.params = {};
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.element = this.panel.zoomable.append('g').classed('layer', true).classed('selectable', plugin.selectable);

        this.disposables.add(this.panel.onDidResize(this.render.bind(this)));
        this.disposables.add(this.panel.onDidRescale(this.render.bind(this)));
        this.disposables.add(this.chart.onDidZoom(this.render.bind(this)));
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
        // return _.isFunction(this.plugin.title) ? this.plugin.title() : '';
    }

    value(candle){
        // return _.isFunction(this.plugin.value) ? this.plugin.value(candle) : '';
    }

    plot(series, options = {}){

    }

    draw(){
        if(this.plugin){
            //TODO Draw the layer instead of recalculating things with the plugin
            // this.plugin.draw();
        }


    }

    render(){}

    title(){
        return '';
    }

    value(){
        return '';
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
    }
}
