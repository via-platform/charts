const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

const keys = [6e4, 3e5, 9e5, 36e5, 108e5, 216e5, 864e5];
const options = {
    6e4: '1m',
    3e5: '5m',
    9e5: '15m',
    36e5: '1h',
    108e5: '3h',
    216e5: '6h',
    864e5: '1d'
};

class Granularity {
    constructor({chart, tools}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.tools = tools;
        etch.initialize(this);

        // this.disposables.add(this.chart.onDidChangeSymbol(this.changedSymbol.bind(this)));
        this.disposables.add(this.chart.onDidChangeGranularity(this.didChangeGranularity.bind(this)));
        this.disposables.add(this.tools.onDidDestroy(this.destroy.bind(this)));
    }

    update(){}

    render(){
        const buttons = keys.map(key => {
            const classes = this.chart.granularity === key ? 'btn btn-subtle mini selected' : 'btn btn-subtle mini';
            return $.div({classList: classes, onClick: () => this.change(key)}, options[key]);
        });

        return $.div({classList: 'granularity btn-group mini'}, ...buttons);
    }

    didChangeGranularity(granularity){
        etch.update(this);
    }

    changedSymbol(symbol){
        if(_.isUndefined(symbol.granularity)){
            //Hide all of the options
            this.element.classList.add('hide');
        }else{
            this.element.classList.remove('hide');

            if(this.chart.granularity < symbol.granularity){
                this.chart.changeGranularity(symbol.granularity);
            }
        }
    }

    change(granularity){
        this.chart.changeGranularity(granularity);
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
    }
}

module.exports = {
    name: 'granularity',
    type: 'tool',
    position: 'right',
    priority: 0,
    instance: params => new Granularity(params)
};
