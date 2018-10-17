module.exports = {
    name: 'date-value-range',
    title: 'Date & Value Range',
    description: 'Draw a date and value range.',
    points: 2,
    params: {},
    render: ({chart, panel, element, points}) => {
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
        element.append('path').classed('boundary', true).attr('d', `M ${sx} ${sy} V ${ey}`);
        element.append('path').classed('boundary', true).attr('d', `M ${ex} ${sy} V ${ey}`);

        element.append('path').classed('direction', true).attr('d', `M ${mx} ${sy} V ${ey}`);
        element.append('path').classed('direction', true).attr('d', `M ${sx} ${my} H ${ex}`);

        element.append('path').classed('arrow', true).attr('d', (ey < sy ? `M ${mx - 3} ${ey + 8} l 3 -8 l 3 8 Z` : `M ${mx - 3} ${ey - 8} l 3 8 l 3 -8 Z`));
        element.append('path').classed('arrow', true).attr('d', (ex < sx ? `M ${ex + 8} ${my - 3} l -8 3 l 8 3 Z` : `M ${ex - 8} ${my - 3} l 8 3 l -8 3 Z`));

        element.selectAll('rect').remove();
        element.append('rect').attr('x', s.x).attr('y', s.y).attr('width', e.x - s.x).attr('height', e.y - s.y);

        element.selectAll('text').remove();
        element.append('text')
            .attr('alignment-baseline', 'hanging')
            .attr('text-anchor', 'middle')
            .attr('x', (ex + sx) / 2)
            .attr('y', e.y + 6)
            .text(`${value} (${percentage}%), ${duration} (${bars} Bars)`);
    }
};