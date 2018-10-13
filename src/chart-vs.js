const _ = require('underscore-plus');
const {Series} = require('via');

const defaults = {
    plot: {},
    line: {},
    histogram: {}
};


module.exports = class VS {
    constructor(plugin, state){
        this._data = [];
        this._index = 0;
        this._params = new Map();
        this._components = new Map();
        this._plugin = plugin;
        this._variables = new Map();

        this.initialize(state);
    }

    calculate(){
        this._index = 0;
        this._variables.clear();

        for(const component of this._components.values()){
            component.series.clear();
        }

        for(const datum of this._data){
            //TODO Precalculate some values like mid / tr
            this._plugin.calculate(this);
            this._index++;
        }
    }

    initialize(state = {}){
        const {components, params} = this._plugin.describe();

        for(const [component, configuration] of Object.entries(components)){
            this._components.set(component, {
                configuration,
                series: new Series()
            });
        }

        for(const [param, configuration] of Object.entries(params)){
            this._params.set(component, Object.assign({}, state.params[param], configuration));
        }
    }

    param(name){
        return this._params.has(name) ? this._params.get(name).value : undefined;
    }

    property(name){
        return this[name];
    }

    plot(id = 'default', value){
        this._components.get(id).series.add(this.timestamp(), value);
    }

    timestamp(){
        return this._data[this._index].time_period_start;
    }

    sma(series, length){
        return series.map((value, index) => this.mean(series.preceding(index, length)));
    }

    ema(series, length, last = 0){
        return series.map((value, index) => last = index ? (value - last) * (2 / (Math.min(index, length) + 1)) + last : value);
    }

    mean(series){
        return series.length ? series.reduce((a, v) => a + v[1], 0) / series.length : 0;
    }

    tr(series){
        return series.map((value, index) => {
            if(index){
                return Math.max(
                    value.price_high - value.price_low,
                    Math.abs(value.price_high - series[index - 1].price_close),
                    Math.abs(value.price_low - series[index - 1].price_close)
                );
            }else{
                return value.price_high - value.price_low;
            }
        });
    }

    number(x){
        return _.isNumber(x);
    }

    series(x){
        return x instanceof Series;
    }

    merge(a, b, fn){
        return a.map((value, index) => fn(value, b[index]));
    }

    add(a, b){
        return this.number(b) ? a.map(value => value + b) : this.merge(a, b, (x, y) => x + y);
    }

    subtract(a, b){
        return this.number(b) ? a.map(value => value - b) : this.merge(a, b, (x, y) => x - y);
    }

    multiply(a, b){
        return this.number(b) ? a.map(value => value * b) : this.merge(a, b, (x, y) => x * y);
    }

    divide(a, b){
        return this.number(b) ? a.map(value => value / b) : this.merge(a, b, (x, y) => x / y);
    }

    max(a, b){
        return this.number(b) ? a.map(value => Math.max(value, b)) : this.merge(a, b, (x, y) => Math.max(x, y)));
    }

    min(a, b){
        return this.number(b) ? a.map(value => Math.min(value, b)) : this.merge(a, b, (x, y) => Math.min(x, y)));
    }

    abs(series){
        return series.map(value => Math.abs(value));
    }

    deviation(series, length){

    }

    rsi(length){
        const avg_ups = this.sma(this.max(this.subtract(this.close, this.open), 0), length);
        const avg_downs = this.sma(this.max(this.subtract(this.open, this.close), 0), length);

        return this.divide(avg_ups, avg_downs).map(value => 100 - 100 / (1 + value));
    }







    //Defining basic properties for easier access

    get open(){
        return this._data.prop('price_open');
    }

    get high(){
        return this._data.prop('price_high');
    }

    get low(){
        return this._data.prop('price_low');
    }

    get close(){
        return this._data.prop('price_close');
    }

    get volume(){
        return this._data.prop('volume_traded');
    }

    get change(){
        return this._data.map(value => (value.price_open + value.price_close) / 2);
    }

    get mid(){
        return this._data.map(value => (value.price_high + value.price_low) / 2);
    }

    get average(){
        return this._data.map(value => (value.price_open + value.price_high + value.price_low + value.price_close) / 4);
    }
}