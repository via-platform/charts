module.exports = {
    name: 'cross-line',
    title: 'Cross Line',
    description: 'Draw a cross line on the chart.',
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
            .attr('d', `M 0 ${Math.round(panel.scale(point.y)) - 0.5} h ${panel.width}`)
            .attr('stroke', '#FFFFFF')
            .attr('stroke-dasharray', 2)
            .attr('stroke-width', 1);

        element.append('path')
            .attr('d', `M ${Math.round(chart.scale(point.x)) - 0.5} 0 v ${panel.height}`)
            .attr('stroke', '#FFFFFF')
            .attr('stroke-dasharray', 2)
            .attr('stroke-width', 1);

        element.append('path').attr('d', `M ${Math.round(chart.scale(point.x)) - 3} 0 h 7 v ${panel.height} h -7 Z`);
        element.append('path').attr('d', `M 0 ${Math.floor(panel.scale(point.y)) - 3} v 7 h ${panel.width} v -7 Z`);
    }
};