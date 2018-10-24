module.exports = {
    name: 'horizontal-line',
    title: 'Horizontal Line',
    description: 'Draw a horizontal line on the chart.',
    points: 1,
    parameters: {
        fixed: 'x'
    },
    render: ({chart, panel, element, points}) => {
        const [point] = points;

        element.selectAll('path').remove();
        element.append('path').attr('d', `M 0 ${Math.floor(panel.scale(point.y)) - 0.5} h ${panel.width}`);
        // this.element.select('rect').attr('width', this.panel.width);
    }
};