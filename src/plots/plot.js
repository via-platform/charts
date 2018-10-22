const Plot = {
    name: 'plot',
    title: 'Plot',
    parameters: {
        style: {
            title: 'Plot Style',
            type: 'string',
            enum: [
                {title: 'Line', value: 'line'},
                {title: 'Area', value: 'area'},
                {title: 'Histogram', value: 'histogram'},
                {title: 'Column', value: 'column'},
                {title: 'Cross', value: 'cross'},
                {title: 'Circle', value: 'circle'},
                {title: 'Step Line', value: 'step'},
            ],
            default: 'line'
        },
        color: {
            title: 'Color',
            type: 'color',
            default: '#0000FF'
        },
        track: {
            title: 'Track Value',
            type: 'boolean',
            default: false
        },
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        }
    },
    render: configuration => {
        const style = configuration.parameters.style || Plot.parameters.style.default;
        const plot = configuration.chart.manager.plots.find(plot => plot.name === style);

        if(!configuration.element.classed(style)){
            configuration.element.attr('class', `plot ${style}`).selectAll('*').remove();
        }

        if(configuration.data){
            plot.render(configuration);
        }
    }
};

module.exports = Plot;