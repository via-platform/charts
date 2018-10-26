//This file is a plugin that handles drawing on the chart. Basically, when a new
//drawing is initiated, this plugin creates the new layer (and cancels the old one, if applicable).
//This plugin listens for clicks as they may occur, until it reaches the specified number of clicks.

//This file is also responsible for managing the draw toolbar menu.

const {Disposable, CompositeDisposable, Emitter, etch} = require('via');
const $ = etch.dom;

module.exports = class Draw {
    static describe(){
        return {
            name: 'draw'
        };
    }

    static instance(params){
        return new Draw(params);
    }

    constructor({chart}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        etch.initialize(this);

        this.disposables.add(this.chart.tools.add({element: this.element, location: 'left', priority: 5}));
        this.disposables.add(via.tooltips.add(this.element, {title: 'Add Drawing', placement: 'bottom', keyBindingCommand: 'charts:add-drawing'}));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:add-drawing', this.select.bind(this)));
    }

    update(){}

    render(){
        return $.div({classList: 'type toolbar-button caret', onClick: this.select.bind(this)}, 'Draw');
    }

    select(){
        this.chart.omnibar.search({
            name: 'Add Chart Drawing',
            placeholder: 'Search For a Drawing Tool...',
            didConfirmSelection: option => this.chart.draw(option.plugin),
            maxResultsPerCategory: 60,
            items: this.chart.manager.drawings.map(plugin => ({name: plugin.title, plugin}))
        });
    }

    destroy(){
        this.disposables.dispose();
    }
}
