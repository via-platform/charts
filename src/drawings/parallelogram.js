module.exports = {
    name: 'parallelogram',
    title: 'Parallelogram',
    description: 'Draw a parallelogram on the chart.',
    points: 3,
    render: ({chart, panel, element, points}) => {
        const [start, middle, end] = points;

        const sx = chart.scale(start.x);
        const sy = panel.scale(start.y);

        const mx = chart.scale(middle.x);
        const my = panel.scale(middle.y);

        element.selectAll('path').remove();

        if(end){
            const ex = chart.scale(end.x);
            const ey = panel.scale(end.y);

            element.append('path').attr('d', `M ${sx} ${sy} L ${mx} ${my} L ${ex} ${ey} l ${sx - mx} ${sy - my} Z`);
        }else{
            element.append('path').attr('d', `M ${sx} ${sy} L ${mx} ${my}`);
        }
    }
};