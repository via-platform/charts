module.exports = {
    name: 'rectangle',
    title: 'Rectangle',
    description: 'Draw a rectangle on the chart.',
    points: 2,
    params: {},
    render: ({chart, panel, element, points}) => {
        const [start, end] = points;

        const sx = chart.scale(start.x);
        const ex = chart.scale(end.x);
        const sy = panel.scale(start.y);
        const ey = panel.scale(end.y);

        const s = {
            x: Math.min(sx, ex),
            y: Math.min(sy, ey)
        };

        const e = {
            x: Math.max(sx, ex),
            y: Math.max(sy, ey)
        };

        element.selectAll('rect').remove();
        element.append('rect').attr('x', s.x).attr('y', s.y).attr('width', e.x - s.x).attr('height', e.y - s.y);
    }
};