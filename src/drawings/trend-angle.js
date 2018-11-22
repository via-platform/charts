module.exports = {
    name: 'trend-angle',
    title: 'Trend Angle',
    description: 'Draw a trend angle on the chart.',
    points: 2,
    selectable: true,
    parameters: {
        stroke: {
            title: 'Stroke Color',
            type: 'color',
            default: '#4594eb'
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
    render: ({chart, panel, element, points, parameters}) => {
        const [start, end] = points;

        const sx = chart.scale(start.x);
        const ex = chart.scale(end.x);
        const sy = panel.scale(start.y);
        const ey = panel.scale(end.y);

        const distance = Math.sqrt(Math.pow(ex - sx, 2) + Math.pow(ey - sy, 2));
        const ratio = 50 / Math.max(0.000001, distance);
        const angle = Math.atan2((ey - sy), (ex - sx));

        const circle_x = (sx * (1 - ratio) + ratio * ex);
        const circle_y = (sy * (1 - ratio) + ratio * ey);

        element.selectAll('path').remove();
        element.selectAll('text').remove();

        element.append('path').attr('class', 'selection').attr('d', `M ${sx} ${sy} L ${ex} ${ey}`).attr('stroke', '#FFFFFF').attr('stroke-width', 1.5);

        element.append('path')
            .attr('class', 'angle')
            .attr('d', `M ${sx} ${Math.round(sy) + 0.5} h 50 A 50 50 0 0 ${(ey < sy) ? 0 : 1} ${circle_x} ${circle_y}`)
            .attr('stroke', '#FFFFFF')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', 2);

        element.append('text')
            .attr('x', sx + 60)
            .attr('y', sy)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'left')
            .attr('fill', '#FFFFFF')
            .text(`${(-1 * angle * 180 / Math.PI).toFixed(2)}°`);
    }
};