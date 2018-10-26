module.exports = {
    name: 'vertical-line',
    title: 'Vertical Line',
    description: 'Draw a vertical line on the chart.',
    points: 1,
    selectable: true,
    parameters: {
        fixed: 'y'
    },
    render: ({chart, panel, element, points}) => {
        const [point] = points;

        element.selectAll('path').remove();
        element.append('path').attr('d', `M ${Math.floor(chart.scale(point.x)) - 0.5} 0 v ${panel.height}`);
        // this.element.select('rect').attr('width', this.panel.width);
    }
};