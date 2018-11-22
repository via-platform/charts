module.exports = {
    name: 'arrow',
    title: 'Arrow',
    description: 'Draw an arrow line on the chart.',
    points: 2,
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
            default: 1.5
        },
        style: {
            title: 'Stroke Style',
            type: 'string',
            enum: ['solid', 'dashed', 'dotted'],
            default: 'solid'
        }
    },
    render: ({chart, panel, element, points}) => {
        const [start, end] = points;

        const sx = chart.scale(start.x);
        const ex = chart.scale(end.x);
        const sy = panel.scale(start.y);
        const ey = panel.scale(end.y);

        element.selectAll('path').remove();

        element.append('path')
            .attr('d', `M ${sx} ${sy} L ${ex} ${ey}`);
    }
};