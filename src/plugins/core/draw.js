//This file is a plugin that handles drawing on the chart. Basically, when a new
//drawing is initiated, this plugin creates the new layer (and cancels the old one, if applicable).
//This plugin listens for clicks as they may occur, until it reaches the specified number of clicks.

//This file is also responsible for managing the draw toolbar menu.

const {Disposable, CompositeDisposable, Emitter, etch} = require('via');
const ChartDrawing = require('../../chart-drawing');
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
        this.disposables.add(via.tooltips.add(this.element, {title: 'Add Indicator', placement: 'bottom', keyBindingCommand: 'charts:add-drawing'}));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:add-drawing', this.select.bind(this)));

        this.disposables.add(via.commands.add(via.workspace.getElement(), {
            'core:delete': this.cancel.bind(this),
            'core:backspace': this.cancel.bind(this),
            'core:cancel': this.cancel.bind(this)
        }));
    }

    update(){}

    render(){
        return $.div({classList: 'type toolbar-button caret', onClick: this.select.bind(this)}, 'Draw');
    }

    select(){
        this.chart.omnibar.search({
            name: 'Add Chart Drawing',
            placeholder: 'Search For a Drawing Tool...',
            didConfirmSelection: option => this.create(option.plugin),
            maxResultsPerCategory: 60,
            items: this.chart.manager.drawings.map(plugin => ({name: plugin.title, plugin}))
        });
    }

    create(plugin){
        if(this.initiate){
            this.initiate.dispose();
        }

        this.initiate = this.chart.onDidClick(({event, target}) => {
            this.cancel();
            target.add(new ChartDrawing({plugin, event, chart: this.chart, panel: target}));
        });
    }

    cancel(){
        if(this.initiate){
            this.initiate.dispose();
            this.initiate = null;
        }
    }

    destroy(){
        if(this.initiate){
            this.initiate.dispose();
        }

        this.disposables.dispose();
    }
}
