const {Disposable, CompositeDisposable, Emitter} = require('via');
const _ = require('underscore-plus');

module.exports = class ChartLayer {
    constructor({chart, panel}){
        this.chart = chart;
        this.panel = panel;
        this.params = {};
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.element = this.panel.zoomable.append('g').classed('layer', true);
    }

    get domain(){
        return [];
    }

    get decimals(){
        return 0;
    }

    select(){
        this.chart.select(this);
    }

    isSelected(){
        return this.chart.selected === this;
    }

    title(){
        // return _.isFunction(this.plugin.title) ? this.plugin.title() : '';
    }

    value(candle){
        // return _.isFunction(this.plugin.value) ? this.plugin.value(candle) : '';
    }

    recalculate(){}

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
