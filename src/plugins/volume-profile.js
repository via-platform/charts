const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const ChartLayer = require('../chart-layer');
const etch = require('etch');
const $ = etch.dom;

module.exports = class VolumeProfile extends ChartLayer {
    static describe(){
        return {
            name: 'volume-profile',
            title: 'Volume Profile',
            description: 'Displays horizontal bars on the indicating volume bought and sold at each price level.',
            parameters: {
                location: {
                    title: 'Location',
                    type: 'string',
                    enum: ['left', 'right'],
                    default: 'right'
                },
                buy: {
                    title: 'Buy Color',
                    type: 'color',
                    default: '#00FF00'
                },
                sell: {
                    title: 'Sell Color',
                    type: 'color',
                    default: '#FF0000'
                },
                width: {
                    title: 'Width %',
                    type: 'number',
                    constraint: x => (x >= 1 && x <= 100),
                    default: 30
                }
            }
        };
    }

    static instance(params){
        return new VolumeProfile(params);
    }

    serialize(){
        return {
            name: 'volume-profile',
            visible: this.visible,
            parameters: this.parameters
        };
    }

    constructor({chart, state}){
        super({chart, panel: chart.center()});

        this.chart.special.push(Object.assign({action: this.toggle.bind(this)}, VolumeProfile.describe()));

        //We need to create a new horizontal scale, but not a new vertical scale
        //The vertical scale is just the panel scale
        this.scale = d3.scaleLinear().domain([100, 0]);
        this.element.classed('volume-profile', true).classed('hide', true);
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));
        this.initialize(state);
    }

    initialize(state = {}){
        this.parameters = {};
        this.removable = false;
        this.visible = state.visible;

        //First set the defaults for each chart type.
        for(const [identifier, definition] of Object.entries(VolumeProfile.describe().parameters)){
            this.parameters[identifier] = definition.default;
        }

        //Then override the defaults with the user's saved state.
        if(state.parameters){
            for(const [parameter, value] of Object.entries(state.parameters)){
                if(this.valid(type.parameters[parameter], value)){
                    this.parameters[parameter] = value;
                }
            }
        }

        this.panel.add(this);
    }

    valid(parameter, value){
        if(!parameter){
            return false;
        }

        if(parameter.enum){
            return (typeof _.first(parameter.enum) === 'object') ? parameter.enum.map(v => v.value).includes(value) : parameter.enum.includes(value);
        }

        if(parameter.constraint){
            return parameter.constraint(value);
        }

        //TODO Check the actual type of the value against the type of the parameter
        return true;
    }

    toggle(){
        this.visible = !this.visible;
        this.panel.render();
    }

    resize(){
        this.scale.range([0, this.panel.width / 3]);
    }

    render(){
        if(this.visible){
            const [start, end] = this.chart.scale.domain();
            const data = this.chart.data.all().range(start, end);

            if(data.length === 0){
                return this.element.classed('hide', true);
            }

            this.element.classed('hide', false);

            const profile_increment = data.prop('profile_increment').max();
            const levels = new Map();

            for(const [key, candle] of data){
                for(const [level, buy, sell] of candle.profile){
                    const rounded = this.coerce(level, profile_increment);
                    const existing = levels.get(rounded);

                    if(existing){
                        existing.buy += buy;
                        existing.sell += sell;
                        existing.total = existing.buy + existing.sell;
                    }else{
                        levels.set(rounded, {level: rounded, buy, sell, total: buy + sell})
                    }
                }
            }

            const values = Array.from(levels.values());
            const max = _.max(values.map(level => level.total));
            const height = Math.floor(this.panel.height * 0.9 / values.length * 0.8);

            this.scale.domain([0, max]);

            const volume_bar = this.element.selectAll('g').data(values, d => d.level);

            volume_bar.select('rect.volume-bar.sell')
                .attr('width', d => this.scale(d.sell))
                .attr('height', height)
                .attr('x', d => this.panel.width - this.scale(d.sell))
                .attr('y', d => Math.floor(this.panel.scale(d.level)));

            volume_bar.select('rect.volume-bar.buy')
                .attr('width', d => this.scale(d.buy))
                .attr('height', height)
                .attr('y', d => Math.floor(this.panel.scale(d.level)))
                .attr('x', d => this.panel.width - this.scale(d.buy) - this.scale(d.sell));

            const volume_bar_enter = volume_bar.enter().append('g');

            volume_bar_enter.append('rect')
                .attr('class', 'volume-bar sell')
                .attr('height', height)
                .attr('width', d => this.scale(d.sell))
                .attr('x', d => this.panel.width - this.scale(d.sell))
                .attr('y', d => Math.floor(this.panel.scale(d.level)));

            volume_bar_enter.append('rect')
                .attr('class', 'volume-bar buy')
                .attr('height', height)
                .attr('width', d => this.scale(d.buy))
                .attr('x', d => this.panel.width - this.scale(d.buy) - this.scale(d.sell))
                .attr('y', d => Math.floor(this.panel.scale(d.level)));

            volume_bar.exit().remove();
        }else{
            this.element.classed('hide', true).selectAll('g').remove();
        }
    }

    coerce(value, profile_increment){
        return Math.floor(value / profile_increment) * profile_increment;
    }

    remove(){
        this.toggle();
    }

    title(){
        return this.visible ? 'Volume Profile' : '';
    }

    get decimals(){
        return this.chart.market ? this.chart.market.precision.price : 0;
    }

    value(band){
        const data = this.chart.data.all();

        if(this.chart.market){
            for(const [key, value] of data){
                if(key.getTime() === band.getTime()){
                    return $.div({classList: 'value'},
                        'Buy', $.span({classList: 'up'}, via.fn.number.formatAmount(value.volume_buy, this.chart.market)),
                        'Sell', $.span({classList: 'down'}, via.fn.number.formatAmount(value.volume_sell, this.chart.market))
                    );
                }
            }
        }

        return '';
    }

    destroy(){
        if(this.subscription){
            this.subscription.dispose();
        }

        this.disposables.dispose();
    }
}
