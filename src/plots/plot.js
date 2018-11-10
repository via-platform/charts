module.exports = {
    name: 'plot',
    title: 'Plot',
    trackable: true,
    parameters: {
        style: {
            title: 'Plot Style',
            type: 'string',
            enum: [
                {title: 'Line', value: 'line'},
                {title: 'Area', value: 'area'},
                {title: 'Histogram', value: 'histogram'},
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

        const parameters = {
            visible: configuration.parameters.visible,
            track: configuration.parameters.track,
            width: configuration.parameters.width
        };

        const options = {};

        if(['line', 'step'].includes(style)){
            parameters.style = 'solid';
        }

        if(['line', 'area', 'step'].includes(style)){
            parameters.stroke = configuration.parameters.color;

            if(configuration.options.stroke){
                options.stroke = configuration.options.stroke;
            }
        }

        if(['area', 'histogram', 'cross', 'circle'].includes(style)){
            parameters.fill = configuration.parameters.color;

            if(configuration.options.fill){
                options.fill = configuration.options.fill;
            }
        }

        if(['histogram'].includes(style)){
            parameters.width = [1, 3, 5, 7][
                [1, 1.5, 2, 2.5].indexOf(configuration.parameters.width)
            ];
        }

        if(['step'].includes(style)){
            parameters.width = configuration.parameters.width < 2 ? 1 : 2;
        }

        if(!configuration.element.classed(style)){
            configuration.element.attr('class', `plot ${style}`).selectAll('*').remove();
        }

        if(configuration.data){
            plot.render(Object.assign({}, configuration, {parameters, options}));
        }
    }
};