const {CompositeDisposable, Disposable, Symbols} = require('via');

module.exports = class ChartStudy {
    constructor(chart, params = {}){
        this.disposables = new CompositeDisposable();
        this.location = params.location;
        this.type = params.type;
        this.symbol = params.symbol;
        this.width = params.width;
        this.height = params.height;
        this.chart = chart;
        this.plugin = null;

        this.element = document.createElement('div');
        this.element.classList.add('chart-study', this.location);

        this.mountPlugin();
    }

    destroy(){
        this.disposables.dispose();
        this.element.parentNode.removeChild(this.element);
        this.plugin.destroy();

        this.element = null;
        this.disposables = null;
    }

    mountPlugin(){
        let plugin = this.chart.plugins.getPlugin(this.type);

        if(!plugin){
            this.chart.addWarning({type: 'error', message: `Could not find plugin ${this.type}.`});
            return;
        }

        this.plugin = new plugin(this);

        if(this.plugin.element){
            this.element.appendChild(this.plugin.element);
        }
    }
}
