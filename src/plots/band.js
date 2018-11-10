module.exports = {
    name: 'band',
    title: 'Vertical Bands',
    trackable: false,
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
    render: ({chart, panel, element, data, parameters, options}) => {
        const bands = element.selectAll('rect').data(data);

        bands.enter()
            .append('rect')
            .merge(bands)
                .attr('x', ([x]) => Math.round(chart.scale(x) - (chart.bandwidth / 2)))
                .attr('y', 0)
                .attr('width', Math.ceil(chart.bandwidth))
                .attr('height', panel.height)
                .attr('fill', options.fill ? (d, i) => options.fill(d, i) : parameters.fill);

        bands.exit().remove();
    }
};
