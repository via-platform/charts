const {Disposable, etch} = require('via');
const _ = require('underscore-plus');
const $ = etch.dom;

module.exports = class ChartTools {
    constructor({chart}){
        this.chart = chart;
        this.tools = [];
        etch.initialize(this);
    }

    render(){
        return $.div({classList: 'chart-tools toolbar'},
            $.div({classList: 'chart-tools-left'},
                this.tools.filter(tool => tool.location === 'left').sort((a, b) => a.priority - b.priority).map(tool => {
                    console.log(tool);
                    return tool.component;
                })
            ),
            $.div({classList: 'chart-tools-spacer'}),
            $.div({classList: 'chart-tools-right'},
                this.tools.filter(tool => tool.location === 'right').sort((a, b) => a.priority - b.priority).map(tool => tool.element)
            )
        );
    }

    update(){}

    add(tool){
        this.tools.push(tool);
        etch.update(this);
        
        return new Disposable(() => _.remove(this.tools, tool));
    }

    destroy(){
        etch.destroy(this);
    }
}
