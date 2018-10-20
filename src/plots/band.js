module.exports = {
    name: 'band',
    title: 'Vertical Bands',
    parameters: {
        fill: {
            title: 'Fill Color',
            type: 'color',
            default: '#0000FF'
        },
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        }
    },
    render: ({chart, panel, element, data, parameters}) => {
        const bands = element.selectAll('rect').data(data);

        bands.enter()
            .append('rect')
            .merge(bands)
                .attr('x', ([x]) => chart.scale(x))
                .attr('y', 0)
                .attr('width', chart.bandwidth)
                .attr('height', panel.height);

        bands.exit().remove();
    }
};
