const {Disposable} = require('via');
const _ = require('underscore-plus');

module.exports = class ChartTools {
    constructor({chart}){
        this.chart = chart;
        this.tools = [];

        this.element = document.createElement('div');
        this.element.classList.add('chart-tools', 'toolbar');

        this.left = document.createElement('div');
        this.spacer = document.createElement('div');
        this.right = document.createElement('div');

        this.left.classList.add('chart-tools-left');
        this.spacer.classList.add('chart-tools-spacer');
        this.right.classList.add('chart-tools-right');

        this.element.appendChild(this.left);
        this.element.appendChild(this.spacer);
        this.element.appendChild(this.right);
    }

    add(tool){
        this.tools.push(tool);
        return new Disposable(() => _.remove(this.tools, tool));
    }

    destroy(){

    }
}
