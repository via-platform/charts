//This file is a plugin that handles drawing on the chart. Basically, when a new
//drawing is initiated, this plugin creates the new layer (and cancels the old one, if applicable).
//This plugin listens for clicks as they may occur, until it reaches the specified number of clicks.

//This file is also responsible for managing the draw toolbar menu.

const {Disposable, CompositeDisposable, Emitter, etch} = require('via');
const $ = etch.dom;

class CoreDrawButton {
    constructor({select}){
        this.select = select;
        etch.initialize(this);
    }

    render(){
        return $.div({classList: 'type toolbar-button caret', onClick: this.select}, 'Draw');
    }

    update(){}
}

module.exports = class CoreDraw {
    static describe(){
        return {
            name: 'core-draw'
        };
    }

    static instance(params){
        return new CoreDraw(params);
    }

    constructor({chart}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;

        this.disposables.add(this.chart.tools.add({
            component: $(CoreDrawButton, {select: this.select.bind(this)}),
            location: 'left',
            priority: 3
        }));
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

    cancel(){
        if(this.initiate){
            this.initiate.dispose();
            this.initiate = null;
        }

        if(this.layer){
            this.layer.destroy();
            this.layer = null;
        }
    }
}