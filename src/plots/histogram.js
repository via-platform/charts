module.exports = {
    name: 'histogram',
    title: 'Histogram',
    trackable: true,
    parameters: {
        fill: {
            title: 'Fill Color',
            type: 'color',
            default: '#FFFFFF'
        },
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        },
        width: {
            title: 'Bar Width',
            type: 'number',
            enum: [1, 3, 5, 7],
            default: 3
        }
    },
    render: ({chart, panel, element, data, parameters}) => {
        if(data){
            const half = (parameters.width + 1) / 2;
            const bars = element.selectAll('rect').data(data);

            // bars.enter()
            //     .append('rect')
            //     .merge(bars)
            //         .attr('x', ([x]) => Math.round(chart.scale(x)) - half)
            //         .attr('y', ([x, y]) => Math.round(panel.scale(Math.max(0, y))))
            //         .attr('width', () => parameters.width)
            //         .attr('height', () => )
            //         .attr('fill', parameters.fill);

            bars.exit().remove();
        }else{
            element.selectAll('rect').remove();
        }
    }
};