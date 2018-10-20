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
                {title: 'Mountain', value: 'mountain'},
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
        if(!configuration.element.classed(configuration.parameters.style.value)){
            configuration.element.attr('class', `plot ${configuration.parameters.style.value}`).selectAll('*').remove();
        }

        chart.manager.plots.[configuration.parameters.style.value](configuration);
    }
};

module.exports = Plot;