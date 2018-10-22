const {Disposable, etch, d3} = require('via');
const _ = require('underscore-plus');
const $ = etch.dom;

module.exports = class ChartTools {
    constructor({chart}){
        this.chart = chart;
        etch.initialize(this);
    }

    render(){
        return $.div({classList: 'chart-tools toolbar'},
            $.div({classList: 'chart-tools-left', ref: 'left'}),
            $.div({classList: 'chart-tools-spacer'}),
            $.div({classList: 'chart-tools-right', ref: 'right'})
        );
    }

    update(){}

    add(tool){
        if(!['left', 'right'].includes(tool.location)){
            throw new Error('Tools must specify a location that is either `left` or `right`.');
        }

        if(!_.isNumber(tool.priority)){
            throw new Error('Tools must specify an integer `priority`.');
        }

        d3.select(tool.element).datum(tool.priority);
        this.refs[tool.location].appendChild(tool.element);
        d3.select(this.refs[tool.location]).selectAll('*').sort();

        return new Disposable(() => this.refs[tool.location].removeChild(tool.element));
    }

    destroy(){
        etch.destroy(this);
    }
}
