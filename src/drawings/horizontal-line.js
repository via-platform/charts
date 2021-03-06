module.exports = {
    name: 'horizontal-line',
    title: 'Horizontal Line',
    description: 'Draw a horizontal line on the chart.',
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
            .attr('d', `M 0 ${Math.floor(panel.scale(point.y)) - 0.5} h ${panel.width}`)
            .attr('stroke', '#FFFFFF')
            .attr('stroke-dasharray', 2)
            .attr('stroke-width', 1);

        element.append('path').attr('d', `M 0 ${Math.floor(panel.scale(point.y)) - 3} v 7 h ${panel.width} v -7 Z`);
    }
};