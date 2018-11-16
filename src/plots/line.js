module.exports = {
    name: 'line',
    title: 'Line',
    trackable: true,
    parameters: {
        stroke: {
            title: 'Stroke Color',
            type: 'color',
            default: '#0000FF'
        },
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        },
        track: {
            title: 'Track Value',
            type: 'boolean',
            default: false
        },
        width: {
            title: 'Stroke Width',
            type: 'number',
            enum: [1, 1.5, 2, 2.5],
            default: 1.5
        },
        style: {
            title: 'Stroke Style',
            type: 'string',
            enum: ['solid', 'dashed', 'dotted'],
            default: 'solid'
        }
    },
    render: ({chart, panel, element, data, parameters, options}) => {
        element.select('path').remove();

        if(data){
            const points = data.array().map(([x, y]) => `${chart.scale(x)} ${panel.scale(y)}`).join(' L ');

            element.append('path')
                .classed('stroke', true)
                .attr('d', `M ${points}`)
                .attr('stroke', options.stroke ? options.stroke() : parameters.stroke)
                .attr('stroke-width', parameters.width)
                .attr('stroke-dasharray', parameters.style === 'solid' ? '' : (parameters.style === 'dashed' ? '5' : '2'));
        }
    }
};