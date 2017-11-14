const {CompositeDisposable, Disposable} = require('via');
const _ = require('underscore-plus');
const keys = [6e4, 3e5, 9e5, 36e5, 72e5, 216e5, 864e5];
const options = {
    6e4: '1m',
    3e5: '5m',
    9e5: '15m',
    36e5: '1h',
    72e5: '2h',
    216e5: '6h',
    864e5: '1d'
};

class Granularity {
    constructor({chart, tools}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.tools = tools;
        this.granularity = this.chart.granularity;
        this.element = document.createElement('div');
        this.element.classList.add('granularity', 'btn-group', 'mini');
        this.buttons = new Map();

        this.disposables.add(this.chart.onDidChangeSymbol(this.changedSymbol.bind(this)));
        this.disposables.add(this.chart.onDidChangeGranularity(this.changedGranularity.bind(this)));
        this.disposables.add(this.tools.onDidDestroy(this.destroy.bind(this)));
        this.attachButtons();
    }

    changedGranularity(granularity){
        if(granularity !== this.granularity){
            this.granularity = granularity;

            for(let key of keys){
                let button = this.buttons.get(key);
                this.granularity === key ? button.classList.add('selected') : button.classList.remove('selected');
            }
        }
    }

    changedSymbol(symbol){
        if(_.isUndefined(symbol.granularity)){
            //Hide all of the options
            this.element.classList.add('hide');
        }else{
            this.element.classList.remove('hide');

            for(let key of keys){
                let button = this.buttons.get(key);
                symbol.granularity > key ? button.classList.add('hide') : button.classList.remove('hide');
            }

            if(this.chart.granularity < symbol.granularity){
                this.chart.changeGranularity(symbol.granularity);
            }
        }
    }

    attachButtons(){
        for(let key of keys){
            let button = document.createElement('button');

            button.classList.add('btn', 'mini');
            button.addEventListener('click', () => this.clicked(key));
            button.textContent = options[key];
            button.title = options[key];

            if(this.chart.granularity === key){
                button.classList.add('selected');
            }

            this.buttons.set(key, button);
            this.element.appendChild(button);
        }
    }

    clicked(granularity){
        this.chart.changeGranularity(granularity);
    }

    destroy(){
        this.buttons.clear();
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'granularity',
    type: 'tool',
    position: 'left',
    priority: 0,
    instance: params => new Granularity(params)
};
