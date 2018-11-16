const _ = require('underscore-plus');
const {etch, Color, d3} = require('via');
const {is_series, is_array} = require('via-script');
const $ = etch.dom;

module.exports = class ChartPlot {
    constructor({chart, panel, layer, component, state}){
        this.chart = chart;
        this.panel = panel;
        this.layer = layer;
        this.component = component;
        this.element = this.layer.element.append('g').attr('class', this.component.type);
        this.plot = this.chart.manager.plots.find(plot => plot.name === this.component.type);

        this.initialize(state);
    }

    initialize(state = {}){
        this.parameters = {};
        this.options = {};

        //First we initialize the plot defaults
        for(const [identifier, value] of Object.entries(this.plot.parameters)){
            this.parameters[identifier] = value.default;
        }

        //Then we override them with the component defaults
        if(this.component.parameters){
            for(const [identifier, value] of Object.entries(this.component.parameters)){
                if(this.plot.parameters.hasOwnProperty(identifier) && this.valid(this.plot.parameters[identifier], value)){
                    this.parameters[identifier] = value;
                }
            }
        }

        //Then we override them further with the saved state params
        //We also have to check and make sure that the state param is (still) valid for the plot, in case
        //of a bad state save, or a change in the plot definition.
        for(const [identifier, value] of Object.entries(state)){
            if(this.plot.parameters.hasOwnProperty(identifier) && this.valid(this.plot.parameters[identifier], value)){
                this.parameters[identifier] = value;
            }
        }

        if(this.plot.trackable){
            this.flag = this.panel.axis.flag();
            this.track = this.layer.element.append('path');

            this.track.attr('class', 'track').attr('stroke-dasharray', 2).attr('stroke-width', '1px');
            this.flag.classed('chart-plot-flag', true).classed('hide', true);
        }
    }

    valid(parameter, value){
        if(parameter.enum){
            return (typeof _.first(parameter.enum) === 'object') ? parameter.enum.map(v => v.value).includes(value) : parameter.enum.includes(value);
        }

        if(parameter.constraint){
            return parameter.constraint(value);
        }

        //TODO Coerce color types for validity
        //TODO Check the actual type of the value against the type of the parameter
        return true;
    }

    update(data, options){
        this.data = data;
        this.options = options;
    }

    render(){
        if(this.plot){
            const [start, end] = this.chart.scale.domain();

            this.plot.render({
                chart: this.chart,
                panel: this.panel,
                element: this.element,
                data: is_series(this.data) ? this.data.range(start, end, this.chart.granularity) : this.data,
                options: this.options,
                selected: this.layer.selected,
                component: this.component,
                parameters: this.parameters
            });

            if(this.plot.trackable){
                const last_value = this.data.last();

                //TODO This is deliberately set to false for now, until there is a way to manually specify
                //whether or not you want to see a price line
                if(last_value && false){
                    const value_string = via.fn.number.formatString(last_value.toFixed(this.panel.decimals));
                    let color = Color.parse('#FFFFFF');

                    //Should probably think of a better way to do this
                    //The issue is that the appropriate color can be specified in a number of
                    //different ways, depending on the type of the chart plot

                    if(this.options.fill){
                        color = Color.parse(this.options.fill(last_value, this.data.length - 1, this.data));
                    }else if(this.options.stroke){
                        color = Color.parse(this.options.stroke(last_value, this.data.length - 1, this.data));
                    }else if(this.options.color){
                        color = Color.parse(this.options.color(last_value, this.data.length - 1, this.data));
                    }else if(this.parameters.color){
                        color = Color.parse(this.parameters.color);
                    }else if(this.parameters.fill){
                        color = Color.parse(this.parameters.fill);
                    }else if(this.parameters.stroke){
                        color = Color.parse(this.parameters.stroke);
                    }

                    this.track.classed('hide', false)
                        .attr('d', `M 0 ${Math.round(this.panel.scale(last_value)) - 0.5} h ${this.panel.width}`)
                        .attr('stroke', color.toRGBAString());

                    this.flag.classed('hide', false)
                        .attr('transform', `translate(0, ${Math.round(this.panel.scale(last_value)) - 10})`)
                        .attr('fill', color.toRGBAString())
                        .select('text')
                            .attr('x', value_string.length * 3 + 6)
                            .attr('fill', color.contrast().toRGBAString())
                            .text(value_string);

                    this.flag.select('rect')
                        .attr('width', value_string.length * 6 + 12);
                }else{
                    this.track.classed('hide', true);
                    this.flag.classed('hide', true);
                }

                if(this.layer.selected){
                    const handle_points = this.data.filter(([x]) => (x.getTime() / this.chart.granularity) % 10 === 0);
                    const handles = this.element.selectAll('circle').data(handle_points);

                    handles.enter()
                            .append('circle')
                        .merge(handles)
                            .raise()
                            .attr('class', 'handle')
                            .attr('cx', ([x]) => this.chart.scale(x))
                            .attr('cy', ([x, y]) => this.panel.scale(y))
                            .attr('r', 5);

                    handles.exit().remove();
                }
            }
        }
    }

    get domain(){
        if(this.data){
            const [start, end] = this.chart.scale.domain();

            if(is_series(this.data)){
                const range = this.data.range(start, end);

                if(range.length){
                    if(this.plot.name === 'stacked-bar'){
                        //We're dealing with a stacked bar or area type series
                        const totals = range.values().map(values => d3.sum(values));
                        return [d3.min(totals), d3.max(totals)];
                    }else if(this.plot.name === 'range'){
                        const flattened = range.flatten();
                        return [d3.min(flattened), d3.max(flattened)];
                    }else{
                        //This is a standard series
                        return [range.min(), range.max()];
                    }
                }
            }else if(is_array(this.data)){
                return [Math.min(...this.data), Math.max(...this.data)];
            }else{
                return [this.data, this.data];
            }
        }

        return [];
    }

    value(band, precision = 0){
        if(this.plot.trackable){
            for(const datum of this.data){
                const [key, value] = datum;

                if(key.getTime() === band.getTime()){
                    //Should probably think of a better way to do this
                    //The issue is that the appropriate color can be specified in a number of
                    //different ways, depending on the type of the chart plot
                    let color = Color.parse('#FFFFFF');

                    if(this.options.fill){
                        color = Color.parse(this.options.fill(value, this.data.indexOf(datum), this.data));
                    }else if(this.options.stroke){
                        color = Color.parse(this.options.stroke(value, this.data.indexOf(datum), this.data));
                    }else if(this.options.color){
                        color = Color.parse(this.options.color(value, this.data.indexOf(datum), this.data));
                    }else if(this.parameters.color){
                        color = Color.parse(this.parameters.color);
                    }else if(this.parameters.fill){
                        color = Color.parse(this.parameters.fill);
                    }else if(this.parameters.stroke){
                        color = Color.parse(this.parameters.stroke);
                    }

                    return $.span({style: `color: ${color.toRGBAString()};`}, via.fn.number.formatString(value.toFixed(precision)));
                }
            }
        }
    }

    destroy(){
        this.element.remove();

        if(this.flag){
            this.flag.remove();
        }

        if(this.track){
            this.track.remove();
        }
    }
}
