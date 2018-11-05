//This file contains the base functionality for the root plot.

const {CompositeDisposable, Disposable, d3, VS, etch} = require('via');
const _ = require('underscore-plus');
const ChartLayer = require('./chart-layer');
const $ = etch.dom;

module.exports = class ChartRoot extends ChartLayer {
    serialize(){
        return {
            type: this.type,
            parameters: this.parameters
        };
    }

    constructor({chart, panel, state}){
        super({chart, panel});

        this.destination = this.element.append('g').attr('class', 'destination');
        this.flag = this.panel.axis.flag().classed('chart-plot-flag', true).classed('hide', true);
        this.track = this.element.append('path').attr('class', 'track').attr('stroke-dasharray', 2).attr('stroke-width', '1px');
        this.handles = this.element.append('g').attr('class', 'handles');

        this.initialize(state);
    }

    initialize(state = {}){
        this.parameters = {};

        //We need to store information about the user's parameters for each chart type.
        //This way, if they switch from line to area and back, their line preferences are retained.
        for(const type of this.chart.manager.types){
            this.parameters[type.name] = {};

            //First set the defaults for each chart type.
            for(const [identifier, definition] of Object.entries(type.parameters)){
                this.parameters[type.name][identifier] = definition.default;
            }

            //Then override the defaults with the user's saved state.
            if(state.parameters && state.parameters[type.name]){
                for(const [parameter, value] of Object.entries(state.parameters[type.name])){
                    if(this.valid(type.parameters[parameter], value)){
                        this.parameters[type.name][parameter] = value;
                    }
                }
            }
        }

        const type = state.type ? state.type : via.config.get('charts.defaultChartType');
        const plugin = this.chart.manager.types.find(plugin => plugin.name === type);

        this.change(plugin);
    }

    change(type){
        if(this.type === type){
            return void via.console.log(`Did not change chart type. You are already looking at a ${type.title.toLowerCase()} chart.`);
        }

        this.type = type;
        this.element.attr('class', `layer ${type.name}`)
        this.destination.selectAll('*').remove();
        this.chart.recalculate();

        this.emitter.emit('did-change-type', this.type);
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

    recalculate(){
        this.data = this.chart.data.all();

        if(this.type.calculate){
            this.data = this.type.calculate({series: this.data, parameters: this.parameters[this.type.name]});
        }
    }

    render(){
        //TODO If selected, render the actual points, flags, and ranges
        const [start, end] = this.chart.scale.domain();

        this.element.classed('selected', this.selected);

        if(this.type){
            const data = this.data.range(start, end, this.chart.granularity);

            this.type.render({
                chart: this.chart,
                panel: this.panel,
                element: this.destination,
                data,
                selected: this.selected,
                parameters: this.parameters[this.type.name]
            });

            const last_value = (this.type.name === 'heikin-ashi') ? this.data.last() : this.chart.data.all().last();

            if(last_value){
                const last_color = (last_value.price_open <= last_value.price_close) ? '#0bd691' : '#ff3b30';

                this.track.classed('hide', false)
                    .attr('d', `M 0 ${Math.round(this.panel.scale(last_value.price_close)) - 0.5} h ${this.panel.width}`)
                    .attr('stroke', last_color);

                this.flag.classed('hide', false)
                    .attr('transform', `translate(0, ${Math.round(this.panel.scale(last_value.price_close)) - 10})`)
                    .attr('fill', last_color)
                    .select('text')
                        .attr('fill', '#FFFFFF')
                        .text(via.fn.number.formatString(last_value.price_close.toFixed(this.decimals)));
            }else{
                this.track.classed('hide', true);
                this.flag.classed('hide', true);
            }

            if(this.selected){
                const handle_points = data.filter(([x]) => (x.getTime() / this.chart.granularity) % 10 === 0);

                let formatted_data = null;

                if(['line', 'area', 'mountain'].includes(this.type.name)){
                    formatted_data = handle_points;
                }else{
                    formatted_data = handle_points.prop('middle');
                }

                const handles = this.handles.selectAll('circle').data(formatted_data);

                handles.enter()
                        .append('circle')
                    .merge(handles)
                        .attr('class', 'handle')
                        .attr('cx', ([x]) => this.chart.scale(x))
                        .attr('cy', ([x, y]) => this.panel.scale(y))
                        .attr('r', 5);

                handles.exit().remove();
            }
        }
    }

    get decimals(){
        return this.chart.market ? this.chart.market.precision.price : 0;
    }

    get domain(){
        if(this.data){
            const [start, end] = this.chart.scale.domain();
            const range = this.data.range(start, end);
            return this.type.domain(range);
        }else{
            return [];
        }
    }

    title(){
        return this.type ? this.type.title : 'No Plot';
    }

    value(band){
        //The reason for this is that we want to show OHLC for the main root but this.data will only contain
        //plot data for several types (e.g. line). Heikin-Ashi is special because it contains its own calculated
        //OHLC data points.

        const data = (this.type.name === 'heikin-ashi') ? this.data : this.chart.data.all();

        if(this.chart.market){
            for(const [key, value] of data){
                if(key.getTime() === band.getTime()){
                    const direction = (value.price_open <= value.price_close) ? 'up' : 'down';

                    return $.div({classList: 'value'},
                        'O', $.span({classList: direction}, via.fn.number.formatPrice(value.price_open, this.chart.market)),
                        'H', $.span({classList: direction}, via.fn.number.formatPrice(value.price_high, this.chart.market)),
                        'L', $.span({classList: direction}, via.fn.number.formatPrice(value.price_low, this.chart.market)),
                        'C', $.span({classList: direction}, via.fn.number.formatPrice(value.price_close, this.chart.market))
                    );
                }
            }
        }

        return '';
    }

    remove(){
        via.console.warn('You cannot remove this layer.');
    }

    onDidChangeType(callback){
        return this.emitter.on('did-change-type', callback);
    }

    destroy(){
        if(this.flag){
            this.flag.remove();
        }

        if(this.track){
            this.track.remove();
        }
    }
}
