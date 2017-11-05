




module.exports = class ChartTools {
    serialize(){
        return {};
    }

    constructor({chart, state}){
        this.chart = chart;
        this.panels = [];

        this.element = document.createElement('div');
        this.element.classList.add('chart-tools');

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

    destroy(){

    }
}
