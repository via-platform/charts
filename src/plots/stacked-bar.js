const {d3} = require('via');

module.exports = {
    name: 'stacked-bar',
    title: 'Stacked Bar',
    trackable: false,
    parameters: {
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        },
        fill: {
            title: 'Fill Color',
            type: 'color',
            default: '#FFF'
        }
    },
    render: ({chart, panel, element, data, parameters, options}) => {
        if(data){
            let width = Math.max(Math.floor(chart.bandwidth * 0.8), 1);

            if(width % 2 === 0){
                width -= 1;
            }

            const keys = d3.range(data.get(0).length);

            const color = d3.scaleOrdinal()
                .unknown(parameters.fill)
                .domain(keys)
                .range(options.fill ? options.fill : d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), keys.length).reverse());

            const bars = element.selectAll('g').data(d3.stack().keys(keys)(data.values()));

            const segments = bars.enter()
                .append('g')
                .merge(bars)
                    .attr('fill', (d, i) => color(i))
                    .selectAll('rect')
                    .data(d => d);

            segments.enter()
                .append('rect')
                .merge(segments)
                    .attr('x', (d, i) => Math.round(chart.scale(data[i][0]) - ((width + 1) / 2)))
                    .attr('y', d => Math.floor(panel.scale(d[1])))
                    .attr('height', d => Math.ceil(panel.scale(d[0]) - panel.scale(d[1])))
                    .attr('width', width);

            bars.exit().remove();
            segments.exit().remove();

        }else{
            element.selectAll('g').remove();
        }
    }
};
