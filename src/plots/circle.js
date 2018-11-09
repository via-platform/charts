module.exports = {
    name: 'circle',
    title: 'Circle',
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
            title: 'Circle Radius',
            type: 'number',
            enum: [1, 2, 3, 4],
            default: 1
        }
    },
    render: ({chart, panel, element, data, parameters, options}) => {
        if(data){
            const circle = element.selectAll('circle').data(data);

            circle.enter()
                .append('circle')
                .merge(circle)
                    .attr('fill', options.fill ? (d, i) => options.fill(d, i, data) : parameters.fill)
                    .attr('cx', ([x]) => chart.scale(x))
                    .attr('cy', ([x, y]) => panel.scale(y))
                    .attr('r', parameters.width);

            circle.exit().remove();
        }else{
            element.selectAll('path').remove();
        }
    }
};