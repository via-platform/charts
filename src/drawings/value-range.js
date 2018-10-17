module.exports = {
    name: 'value-range',
    title: 'Value Range',
    description: 'Draw a value range.',
    points: 2,
    params: {},
    render: ({chart, panel, element, points}) => {
        const [start, end] = points;

        const sx = chart.scale(start.x);
        const ex = chart.scale(end.x);
        const sy = panel.scale(start.y);
        const ey = panel.scale(end.y);

        const mid = (ex + sx) / 2;
        const value = (end.y - start.y).toFixed(panel.precision);
        const percentage = ((end.y - start.y) / start.y * 100).toFixed(2);

        const s = {
            x: Math.min(sx, ex),
            y: Math.min(sy, ey)
        };

        const e = {
            x: Math.max(sx, ex),
            y: Math.max(sy, ey)
        };

        element.selectAll('path').remove();
        element.append('path').classed('boundary', true).attr('d', `M ${sx} ${sy} H ${ex}`);
        element.append('path').classed('boundary', true).attr('d', `M ${sx} ${ey} H ${ex}`);
        element.append('path').classed('direction', true).attr('d', `M ${mid} ${sy} V ${ey}`);
        element.append('path').classed('arrow', true).attr('d', (ey < sy ? `M ${mid - 3} ${ey + 8} l 3 -8 l 3 8 Z` : `M ${mid - 3} ${ey - 8} l 3 8 l 3 -8 Z`));

        element.selectAll('rect').remove();
        element.append('rect').attr('x', s.x).attr('y', s.y).attr('width', e.x - s.x).attr('height', e.y - s.y);

        element.selectAll('text').remove();
        element.append('text')
            .attr('alignment-baseline', 'hanging')
            .attr('text-anchor', 'middle')
            .attr('x', (ex + sx) / 2)
            .attr('y', e.y + 6)
            .text(`${value} (${percentage}%)`);
    }
};