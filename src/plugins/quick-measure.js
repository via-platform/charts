const {Disposable, CompositeDisposable} = require('event-kit');
const ChartDrawing = require('../chart-drawing');
const _ = require('underscore-plus');

module.exports = class QuickMeasure {
    static describe(){
        return {
            name: 'quick-measure',
            title: 'Quick Measure',
            description: 'Quickly select the measurement tool by shift-clicking on the chart.',
        };
    }

    static instance(params){
        return new QuickMeasure(params);
    }

    constructor({chart}){
        this.chart = chart;
        this.plugin = this.chart.manager.drawings.find(tool => tool.name === 'measure');

        this.disposables = new CompositeDisposable(
            this.chart.onDidClick(this.click.bind(this))
        );
    }

    click({event, target}){
        if(event.shiftKey){
            this.chart.unselect();
            this.chart.cancel();

            event.preventDefault();
            event.stopPropagation();

            this.chart.select(target.add(new ChartDrawing({plugin: this.plugin, event, chart: this.chart, panel: target})));
        }
    }

    destroy(){
        this.disposables.dispose();
    }
}
