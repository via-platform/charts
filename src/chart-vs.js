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
