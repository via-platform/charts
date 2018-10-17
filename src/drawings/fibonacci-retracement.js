const components = ['boxes', 'lines', 'labels'];
const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.618, 2.618, 3.618, 4.236];

module.exports = {
    name: 'fibonacci-retracement',
    title: 'Fibonacci Retracement',
    description: 'Draw a Fibonacci Retracement on the chart.',
    points: 2,
    params: {},
    render: ({chart, panel, element, points}) => {
        const [start, end] = points;

        const sx = chart.scale(start.x);
        const ex = chart.scale(end.x);
        const sy = panel.scale(start.y);
        const ey = panel.scale(end.y);

        const lx = Math.min(sx, ex); //Left x
        const by = Math.min(sy, ey); //Bottom y

        const rx = Math.max(sx, ex); //Right x
        const ty = Math.max(sy, ey); //Top y

        element.select('path.direction').remove();
        element.append('path').classed('direction', true).attr('d', `M ${sx} ${sy} L ${ex} ${ey}`);
        element.selectAll('g').data(components).enter().append('g').attr('class', d => d);

        const lines = element.select('g.lines').selectAll('path').data(levels);

        lines.enter()
            .append('path')
            .merge(lines)
                .attr('d', d => `M ${sx} ${Math.floor(ey - d * (ey - sy)) - 0.5} h ${ex - sx}`);

        const labels = element.select('g.labels').selectAll('text').data(levels);

        labels.enter()
            .append('text')
            .merge(labels)
                .attr('alignment-baseline', 'middle')
                .attr('text-anchor', 'end')
                .attr('x', lx - 5)
                .attr('y', d => Math.floor(ey - d * (ey - sy)))
                .text(d => `${d} (${panel.scale.invert(ey - d * (ey - sy)).toFixed(panel.precision)})`)
                .attr('d', d => `M ${sx} ${Math.floor(ey - d * (ey - sy)) - 0.5} h ${ex - sx}`);

        const boxes = element.select('g.boxes').selectAll('rect').data(levels.slice(1));

        boxes.enter()
            .append('rect')
            .merge(boxes)
                .attr('x', lx)
                .attr('y', (d, i) => Math.floor(ey - levels[(sy < ey ? i + 1 : i)] * (ey - sy)) - 0.5)
                .attr('width', rx - lx)
                .attr('height', (d, i) => (d - levels[i]) * (ty - by));
    }
};