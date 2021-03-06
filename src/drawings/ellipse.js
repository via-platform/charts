module.exports = {
    name: 'ellipse',
    title: 'Ellipse',
    description: 'Draw a ellipse on the chart.',
    points: 3,
    selectable: true,
    parameters: {},
    handles: points => {
        const [start, middle, end] = points;

        if(end){
            const cx = (start.x + middle.x) / 2
            const cy = (start.y + middle.y) / 2;

            const dx = (middle.x / start.x);
            const dy = (middle.y - start.y);

            const u = ((end.x - start.x) * dx + (end.y - start.y) * dy) / (Math.pow(dx, 2) + Math.pow(dy, 2));

            console.log(u);
            console.log({x: new Date(start.x.getTime() + u * dx), y: start.y + u * dy});

            return [start, middle, {x: new Date(start.x.getTime() + u * dx), y: start.y + u * dy}];
        }

        return [start, middle];
    },
    render: ({chart, panel, element, points}) => {
        const [start, middle, end] = points;

        const sx = chart.scale(start.x);
        const sy = panel.scale(start.y);
        const mx = chart.scale(middle.x);
        const my = panel.scale(middle.y);

        element.selectAll('path').remove();
        element.selectAll('ellipse').remove();

        if(end){
            const ex = chart.scale(end.x);
            const ey = panel.scale(end.y);

            const cx = (sx + mx) / 2
            const cy = (sy + my) / 2;
            const rx = Math.sqrt(Math.pow(mx - sx, 2) + Math.pow(my - sy, 2)) / 2;
            const ry = (sx === mx) ? Math.abs(ex - sx) : Math.abs((my - sy) * ex - (mx - sx) * ey + (mx * sy) - (sx * my)) / (rx * 2);
            const degrees = (sx === mx) ? 90 : Math.atan2((my - sy) / (mx - sx), 1) * 180 / Math.PI

            element.append('ellipse').attr('cx', cx).attr('cy', cy).attr('rx', rx).attr('ry', ry).attr('transform', `rotate(${degrees} ${cx} ${cy})`);
        }else{
            element.append('path').attr('d', `M ${sx} ${sy} L ${mx} ${my}`);
        }
    }
};