module.exports = {
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
        width: {
            title: 'Width',
            type: 'number',
            enum: [1, 1.5, 2, 2.5],
            default: 1.5
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
        const style = configuration.parameters.style;
        const plot = configuration.chart.manager.plots.find(plot => plot.name === style);

        configuration.parameters = {
            visible: configuration.parameters.visible,
            track: configuration.parameters.track,
            width: configuration.parameters.width
        };

        if(['line', 'step'].includes(style)){
            configuration.parameters.style = 'solid';
        }

        if(['line', 'area', 'step'].includes(style)){
            configuration.parameters.stroke = configuration.parameters.color;
        }

        if(['area', 'histogram', 'column', 'cross', 'circle'].includes(style)){
            configuration.parameters.fill = configuration.parameters.color;
        }

        if(!configuration.element.classed(style)){
            configuration.element.attr('class', `plot ${style}`).selectAll('*').remove();
        }

        if(configuration.data){
            plot.render(configuration);
        }
    }
};