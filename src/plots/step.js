module.exports = {
    name: 'step',
    title: 'Step Line',
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
            enum: [1, 2],
            default: 1
        },
        style: {
            title: 'Stroke Style',
            type: 'string',
            enum: ['solid', 'dashed', 'dotted'],
            default: 'solid'
        }
    },
    render: ({chart, panel, element, data, parameters}) => {
        element.select('path').remove();

        if(data){
            const points = data.array().map(([x, y], index) => {
                if(index){
                    return `H ${Math.round(chart.scale(x) - (chart.bandwidth / 2)) - 0.5} V ${Math.round(panel.scale(y)) - 0.5}`;
                }else{
                    return `M ${Math.round(chart.scale(x) - (chart.bandwidth / 2)) - 0.5} ${Math.round(panel.scale(y)) - 0.5}`;
                }
            }).join(' ');

            element.append('path')
                .classed('stroke', true)
                .attr('d', `${points} h ${chart.bandwidth}`)
                .attr('stroke', parameters.stroke)
                .attr('stroke-width', parameters.width)
                .attr('stroke-dasharray', parameters.style === 'solid' ? '' : (parameters.style === 'dashed' ? '5' : '2'));
        }
    }
};