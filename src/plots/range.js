const d3 = require('d3');

module.exports = {
    name: 'range',
    title: 'Range',
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
    render: ({chart, panel, element, data, parameters}) => {
        element.select('path').remove();

        if(data){
            const area = d3.area()
                .x(([x]) => chart.scale(x))
                .y0(([x, y]) => panel.scale(y[0]))
                .y1(([x, y]) => panel.scale(y[1]));

            element.append('path')
                .datum(data.array())
                .attr('d', area)
                .attr('fill', parameters.fill);
        }
    }
};
