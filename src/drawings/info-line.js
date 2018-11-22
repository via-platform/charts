module.exports = {
    name: 'info-line',
    title: 'Info Line',
    description: 'Draw a trend line on the chart and its details will be displayed alongside.',
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
        },
        text: {
            title: 'Text Color',
            type: 'color',
            default: '#FFFFFF'
        }
    },
    render: ({chart, panel, element, points, parameters}) => {
        const [start, end] = points;

        const sx = chart.scale(start.x);
        const ex = chart.scale(end.x);
        const sy = panel.scale(start.y);
        const ey = panel.scale(end.y);

        const mx = (ex + sx) / 2;
        const my = (ey + sy) / 2;

        const value = (end.y - start.y).toFixed(panel.precision);
        const percentage = ((end.y - start.y) / start.y * 100).toFixed(2);
        const bars = (end.x - start.x) / chart.granularity;
        const duration = via.fn.time.duration(start.x, end.x, 'd[d], h[h], m[m], s[s]', {largest: 2, trim: 'both'});
        const angle = Math.atan2((ey - sy), (ex - sx)) * 180 / Math.PI;
        const slope = (ey - sy) / (ex - sx);

        element.selectAll('path').remove();
        element.selectAll('g').remove();

        element.append('path').attr('class', 'selection').attr('d', `M ${sx} ${sy} L ${ex} ${ey}`).attr('stroke', '#FFFFFF').attr('stroke-width', 1.5);
        element.append('path').attr('class', 'target').attr('d', `M ${sx} ${sy} L ${ex} ${ey}`);

        const text_group = element.append('g')
            .classed('info-line-text-group', true)
            .attr('transform', `translate(${mx + 15}, ${my + ((slope < 0) ? 15 : -45)})`);

        text_group.append('text').attr('y', 0).text(`${value} (${percentage}%)`);
        text_group.append('text').attr('y', 18).text(`${duration} (${bars} Bars)`);
        text_group.append('text').attr('y', 36).text(`${angle.toFixed(2)}°`);
    }
};