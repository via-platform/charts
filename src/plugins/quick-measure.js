const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');

class QuickMeasure {
    constructor({chart}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;

        this.disposables.add(this.chart.onDidClick(this.click.bind(this)));
    }

    click({event, target}){
        if(event.shiftKey){
            this.chart.unselect();
            this.chart.cancel();

            event.preventDefault();
            event.stopPropagation();

            target.addLayer(this.chart.plugins.get('measure'), event);
        }
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'quick-measure',
    type: 'other',
    settings: {},
    title: 'Quick Measure',
    description: 'Quickly select the measurement tool by shift-clicking on the chart.',
    instance: params => new QuickMeasure(params)
};
