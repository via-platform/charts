const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class Indicators {
    constructor({chart, tools}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.tools = tools;

        this.items = Array.from(this.chart.plugins.values())
            .filter(plugin => ['indicator', 'overlay'].includes(plugin.type))
            .map(plugin => ({group: plugin.type, name: plugin.title, description: plugin.description, plugin}));

        etch.initialize(this);

        this.disposables.add(this.tools.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(via.tooltips.add(this.element, {title: 'Add Indicator', placement: 'bottom', keyBindingCommand: 'charts:add-indicator'}));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:add-indicator', this.add.bind(this)));
    }

    update(){}

    render(){
        return $.div({classList: 'type toolbar-button caret', onClick: this.add.bind(this)}, 'Indicators');
    }

    add(){
        if(this.chart.omnibar){
            this.chart.omnibar.search({
                name: 'Add Chart Indicator',
                placeholder: 'Search For an Indicator to Add...',
                items: this.items,
                didConfirmSelection: selection => {
                    if(selection.plugin.type === 'indicator'){
                        this.chart.panels.addPanel(selection.plugin);
                    }else{
                        this.chart.panels.getCenter().addLayer(selection.plugin);
                    }
                }
            });
        }else{
            console.error('Could not find omnibar.');
        }
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
    }
}

module.exports = {
    name: 'indicators',
    type: 'tool',
    position: 'left',
    priority: 0,
    title: 'Indicators',
    description: 'Add indicators to your chart.',
    instance: params => new Indicators(params)
};
