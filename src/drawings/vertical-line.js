module.exports = {
    name: 'vertical-line',
    title: 'Vertical Line',
    description: 'Draw a vertical line on the chart.',
    points: 1,
    selectable: true,
    parameters: {
        stroke: {
            title: 'Stroke Color',
            type: 'color',
            default: '#FFFFFF'
        },
        width: {
            title: 'Stroke Width',
            type: 'number',
            enum: [1, 1.5, 2, 2.5],
            default: 1
        },
        style: {
            title: 'Stroke Style',
            type: 'string',
            enum: ['solid', 'dashed', 'dotted'],
            default: 'solid'
        }
    },
    render: ({chart, panel, element, points}) => {
        const [point] = points;

        element.selectAll('path').remove();

        element.append('path')
            .attr('d', `M ${Math.round(chart.scale(point.x)) - 0.5} 0 v ${panel.height}`)
            .attr('stroke', '#FFFFFF')
            .attr('stroke-dasharray', 2)
            .attr('stroke-width', 1);

        element.append('path').attr('d', `M ${Math.round(chart.scale(point.x)) - 3} 0 h 7 v ${panel.height} h -7 Z`);
    }
};