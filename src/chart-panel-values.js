const {Disposable, CompositeDisposable, Emitter} = require('via');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

module.exports = class ChartPanelValues {
    constructor({panel, chart}){
        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.panel = panel;
        this.chart = chart;
        this.candle = new Date(Math.floor(Date.now() / this.chart.granularity) * this.chart.granularity);

        etch.initialize(this);

        this.disposables.add(this.panel.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.panel.onDidDraw(() => this.update()));
        this.disposables.add(this.panel.onDidAddLayer(() => this.update()));
        this.disposables.add(this.panel.onDidRemoveLayer(() => this.update()));
        this.disposables.add(this.panel.onDidModifyLayer(() => this.update()));

        this.disposables.add(this.chart.onDidMouseMove(this.update.bind(this)));
        this.disposables.add(this.chart.onDidMouseOut(this.update.bind(this)));
    }

    render(){
        return $.div({classList: 'panel-values'}, this.panel.layers.map(layer => $(ChartPanelValue, {layer, candle: this.candle})));
    }

    update({event} = {}){
        if(event){
            let date = event.type === 'mousemove' ? this.chart.scale.invert(event.offsetX) : new Date(Math.floor(Date.now() / this.chart.granularity) * this.chart.granularity);

            if(date.getTime() > Date.now()){
                date = new Date(Math.floor(Date.now() / this.chart.granularity) * this.chart.granularity);
            }

            this.candle = new Date(Math.round(date.getTime() / this.chart.granularity) * this.chart.granularity);
        }

        etch.update(this);
    }

    destroy(){
        etch.destroy(this);
        this.disposables.dispose();
        this.emitter.dispose();
    }
}

class ChartPanelValue {
    constructor({layer, candle}){
        this.layer = layer;
        this.candle = candle;
        this.disposables = new CompositeDisposable();

        etch.initialize(this);

        this.disposables.add(via.commands.add(this.element, {
            'charts:remove-layer': () => this.layer.remove()
        }));
    }

    render(){
        //Just don't list layers that do not provide a title (for now at least).
        //For they moment, they just can't be removed the normal way
        const title = this.layer.title();
        const value = this.layer.value(this.candle);
        const options = {classList: 'panel-value'};

        if(this.layer.selectable){
            options.onClick = () => this.layer.select();
        }

        return title ? $.div(options, $.div({classList: 'title'}, title), value) : $.div({});
    }

    update({candle, layer}){
        this.layer = layer;
        this.candle = candle;
        etch.update(this);
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
    }
}
