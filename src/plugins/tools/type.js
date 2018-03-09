const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class Type {
    constructor({chart, tools}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.tools = tools;
        this.types = Array.from(this.chart.plugins.values()).filter(plugin => plugin.type === 'plot');

        etch.initialize(this);

        this.disposables.add(this.tools.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.chart.onDidChangeType(this.changed.bind(this)));
        this.disposables.add(via.tooltips.add(this.element, {title: 'Change Chart Type', placement: 'bottom', keyBindingCommand: 'charts:change-type'}));
        this.disposables.add(via.commands.add(this.chart.element, 'charts:change-type', this.change.bind(this)));
    }

    update(){}

    render(){
        const plugin = this.chart.getTypePlugin();

        return $.div({classList: 'type toolbar-button caret', onClick: this.change.bind(this)}, plugin ? plugin.title : 'Unknown Type');
    }

    selected(){
        this.chart.changeType(this.element.value);
    }

    change(){
        if(this.chart.omnibar){
            this.chart.omnibar.search({
                name: 'Change Chart Type',
                placeholder: 'Select a Chart Type...',
                items: this.types.map(plugin => ({name: plugin.title, description: plugin.description, value: plugin.name})),
                didConfirmSelection: selection => this.chart.changeType(selection.value)
            });
        }else{
            console.error('Could not find omnibar.');
        }
    }

    changed(type){
        etch.update(this);
    }

    destroy(){
        this.disposables.dispose();
        return etch.destroy(this);
    }
}

module.exports = {
    name: 'type',
    type: 'tool',
    position: 'left',
    priority: 1,
    title: 'Chart Type',
    description: 'Change the type of the corresponding chart.',
    instance: params => new Type(params)
};
