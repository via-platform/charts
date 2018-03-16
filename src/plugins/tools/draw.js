const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class Draw {
    constructor({chart, tools}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.tools = tools;

        this.items = Array.from(this.chart.plugins.values())
            .filter(plugin => plugin.type === 'drawing')
            .map(plugin => ({group: plugin.type, name: plugin.title, description: plugin.description, plugin}));

        etch.initialize(this);

        this.disposables.add(this.tools.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(via.tooltips.add(this.element, {title: 'Add Drawing', placement: 'bottom', keyBindingCommand: 'charts:add-drawing'}));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:add-drawing', this.add.bind(this)));
    }

    update(){}

    render(){
        return $.div({classList: 'type toolbar-button caret', onClick: this.add.bind(this)}, 'Draw');
    }

    add(){
        if(!this.chart.omnibar) return;

        this.chart.omnibar.search({
            name: 'Add Chart Drawing',
            placeholder: 'Search For a Drawing Tool...',
            items: this.items,
            didConfirmSelection: selection => this.chart.draw(selection.plugin)
        });
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
    }
}

module.exports = {
    name: 'draw',
    type: 'tool',
    position: 'left',
    priority: 0,
    title: 'Draw',
    description: 'Add drawings to your chart.',
    instance: params => new Draw(params)
};
