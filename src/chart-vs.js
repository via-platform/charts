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
        this._components.get(id).series.add(value);
    }

    number(x){
        return _.isNumber(x);
    }

    series(x){
        return x instanceof Series;
    }

    merge(a, b, fn){
        return a.map((value, index) => fn(value, b.get(index)));
    }

    iff(series, affirmative, negative){

    }

    offset(series, length){
        return series.map((value, index) => (index - length) >= 0 ? series.get(index - length) : 0);
    }


    //Math functions

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

    acos(series){
        return series.map(value => Math.acos(value));
    }

    asin(series){
        return series.map(value => Math.asin(value));
    }

    atan(series){
        return series.map(value => Math.atan(value));
    }

    cos(series){
        return series.map(value => Math.cos(value));
    }

    sin(series){
        return series.map(value => Math.sin(value));
    }

    tan(series){
        return series.map(value => Math.tan(value));
    }

    sqrt(series){
        return series.map(value => Math.sqrt(value));
    }

    ceil(series){
        return series.map(value => Math.series(value));
    }

    floor(series){
        return series.map(value => Math.floor(value));
    }

    round(series){
        return series.map(value => Math.round(value));
    }

    total(series){
        return series.reduce((accumulator, value) => accumulator + value, 0);
    }

    exp(series){
        return series.map(value => Math.exp(value));
    }

    log(series, base = Math.E){
        return series.map(value => Math.log(value) / Math.log(base));
    }

    pow(series, power){
        return series.map(value => Math.pow(value, power));
    }

    sign(series){
        return this.series.map(value => {
            if(value > 0){
                return 1;
            }else if(value < 0){
                return -1;
            }else{
                return 0;
            }
        });
    }

    sum(series, length){
        return series.map((value, index) => this.total(series.preceding(index, length)));
    }



    //Date functions

    time(){
        return series.keys();
    }

    moment(series, format){
        return series.keys().map(value => moment(value).format(format));
    }

    day_of_month(series){
        return this.moment(series, 'D');
    }

    day_of_week(series){
        return this.moment(series, 'd');
    }

    hour(series){
        return this.moment(series, 'H');
    }

    minute(series){
        return this.moment(series, 'mm');
    }

    second(series){
        return this.moment(series, 'ss');
    }

    am_pm(series){
        return this.moment(series, 'A');
    }

    week_of_year(series){
        return this.moment(series, 'W');
    }

    year(series){
        return this.moment(series, 'YYYY');
    }



    //Technical analysis

    change(series, length = 1){
        return series.map((value, index) => (index - length > 0) ? value - series.get(index - length) : 0);
    }

    rma(series, length, last = 1){
        return series.map((value, index) => last = value / Math.min(index, length) + (1 - (1 / Math.min(index, length))) * last);
    }

    rsi(length){
        const avg_ups = this.sma(this.max(this.subtract(this.close, this.open), 0), length);
        const avg_downs = this.sma(this.max(this.subtract(this.open, this.close), 0), length);

        return this.divide(avg_ups, avg_downs).map(value => 100 - 100 / (1 + value));
    }

    alma(series, length, offset, sigma){
        const m = Math.floor(offset * (length - 1));
        const s = length / sigma;
    }

    atr(series, length){
        return this.rma(this.tr(series));
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
                    Math.abs(value.price_high - series.price_close),
                    Math.abs(value.price_low - series.get(index - 1).price_close)
                );
            }else{
                return value.price_high - value.price_low;
            }
        });
    }

    since(series, condition){
        //Returns a new series with the length (for each bar) since the condition was true
    }

    cci(){

    }

    cog(){

    }

    correlation(){

    }

    cross(a, b){
        //Returns a new series of booleans, true if the series have crossed, false if not
    }

    crossover(a, b){
        //Returns a new series of booleans, true if a has crossed over b, false if not
    }

    crossunder(a, b){
        //Returns a new series of booleans, true if a has crossed under b, false if not
    }

    rising(series, length){
        //True if current x is greater than any previous x for y bars back, false otherwise
    }

    falling(series, length){
        //True if current x is less than any previous x for y bars back, false otherwise
    }

    highest(series, length){
        //Highest value for a given number of bars back
    }

    lowest(series, length){
        //Lowest value for a given number of bars back
    }

    highest_bars(series, length){
        //Offset to the highest value for a given number of bars back
    }

    lowest_bars(series, length){
        //Offset to the lowest value for a given number of bars back
    }

    linreg(series, length, offset){

    }

    macd(series, fast, slow, signal){

    }

    momentum(series, length = 1){

    }

    percentile_linear_interpolation(){

    }

    percentile_nearest_rank(){

    }

    percent_rank(){

    }

    pivot_high(){

    }

    pivot_low(){

    }

    roc(){

    }

    sar(){

    }

    deviation(series, length){

    }

    standard_deviation(series, length){

    }

    stochastic(series, high, low, length){

    }

    swma(series){

    }

    tsi(){

    }

    when(condition, series, value){

    }

    variance(series, length){

    }

    vwap(series){
        return series.prop('vwap');
    }

    vwma(series, length){

    }

    wma(series, length){

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

    get oc(){
        return this._data.map(value => (value.price_open + value.price_close) / 2);
    }

    get mid(){
        return this._data.map(value => (value.price_high + value.price_low) / 2);
    }

    get average(){
        return this._data.map(value => (value.price_open + value.price_high + value.price_low + value.price_close) / 4);
    }
}
