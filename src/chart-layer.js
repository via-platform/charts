const {Disposable, CompositeDisposable, Emitter} = require('via');
const _ = require('underscore-plus');

module.exports = class ChartLayer {
    constructor({chart, panel}){
        this.chart = chart;
        this.panel = panel;
        this.params = {};
        this.selectable = true;
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.element = this.panel.zoomable.append('g').classed('layer', true);
    }

    get domain(){
        return [];
    }

    get decimals(){
        return 0;
    }

    get selected(){
        return this.chart.selected === this;
    }

    select(){
        this.chart.select(this);
    }

    recalculate(){}

    render(){}

    title(){
        return '';
    }

    value(){
        return '';
    }

    remove(){
        if(this.selected){
            this.chart.unselect();
        }

        this.panel.remove(this);
    }

    async customize(){
        const modal = await via.modal.form({height: 200}, {});

        modal.on('did-change-value', data => {
            console.log(data);
        });
    }

    destroy(){
        this.element.remove();
        this.disposables.dispose();
    }
}
