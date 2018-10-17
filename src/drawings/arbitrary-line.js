module.exports = {
    name: 'arbitrary-line',
    title: 'Line',
    description: 'Draw an arbitrary line on the chart.',
    points: 2,
    render: ({chart, panel, element, points}) => {
        const [start, end] = points;

        const sx = chart.scale(start.x);
        const ex = chart.scale(end.x);
        const sy = panel.scale(start.y);
        const ey = panel.scale(end.y);

        element.selectAll('path').remove();
        element.append('path').attr('class', 'selection').attr('d', `M ${sx} ${sy} L ${ex} ${ey}`);
        element.append('path').attr('class', 'target').attr('d', `M ${sx} ${sy} L ${ex} ${ey}`);
    }
};