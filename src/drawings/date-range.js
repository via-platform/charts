module.exports = {
    name: 'date-range',
    title: 'Date Range',
    description: 'Draw a date range.',
    points: 2,
    selectable: true,
    parameters: {},
    render: ({chart, panel, element, points}) => {
        const [start, end] = points;

        const sx = Math.round(chart.scale(start.x));
        const ex = Math.round(chart.scale(end.x));
        const sy = Math.round(panel.scale(start.y));
        const ey = Math.round(panel.scale(end.y));

        const mid = ((ey + sy) % 2 === 0) ? (ey + sy) / 2 : (ey + sy + 1) / 2;
        const bars = (end.x - start.x) / chart.granularity;
        const duration = via.fn.time.duration(start.x, end.x, 'd[d], h[h], m[m], s[s]', {largest: 2, trim: 'both'});

        const s = {
            x: Math.min(sx, ex),
            y: Math.min(sy, ey)
        };

        const e = {
            x: Math.max(sx, ex),
            y: Math.max(sy, ey)
        };

        element.selectAll('path').remove();
        element.append('path').classed('boundary', true).attr('d', `M ${sx + 0.5} ${sy} V ${ey}`);
        element.append('path').classed('boundary', true).attr('d', `M ${ex + 0.5} ${sy} V ${ey}`);
        element.append('path').classed('direction', true).attr('d', `M ${sx + 0.5} ${mid + 0.5} H ${ex}`);
        element.append('path').classed('arrow', true).attr('d', (ex < sx ? `M ${ex + 8} ${mid - 2.5} l -8 3 l 8 3 Z` : `M ${ex - 8} ${mid - 2.5} l 8 3 l -8 3 Z`));

        element.selectAll('rect').remove();
        element.append('rect').attr('x', s.x).attr('y', s.y).attr('width', e.x - s.x).attr('height', e.y - s.y);

        element.selectAll('text').remove();
        element.append('text')
            .attr('alignment-baseline', 'hanging')
            .attr('text-anchor', 'middle')
            .attr('x', (ex + sx) / 2)
            .attr('y', e.y + 6)
            .text(`${duration} (${bars} Bars)`);
    }
};