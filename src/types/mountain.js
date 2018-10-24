const {VS, UUID, Color} = require('via');
const _ = require('underscore-plus');

module.exports = {
    name: 'mountain',
    title: 'Mountain',
    parameters: {
        property: {
            title: 'Property',
            type: 'string',
            enum: [
                {title: 'Open', value: 'price_open'},
                {title: 'High', value: 'price_high'},
                {title: 'Low', value: 'price_low'},
                {title: 'Close', value: 'price_close'},
                {title: 'HL Midpoint', value: 'middle'},
                {title: 'OHLC Average', value: 'average'}
            ],
            default: 'price_close'
        },
        stroke: {
            title: 'Stroke Color',
            type: 'color',
            default: '#FFF'
        },
        fill: {
            title: 'Fill Color',
            type: 'color',
            default: '#4594eb'
        },
        width: {
            title: 'Stroke Width',
            type: 'number',
            enum: [1, 1.5, 2, 2.5],
            default: 1.5
        }
    },
    calculate: ({series, parameters}) => {
        return VS.prop(series, parameters.property);
    },
    domain: series => {
        return series.length ? [series.min(), series.max()] : [];
    },
    render: ({chart, panel, element, data, parameters}) => {
        element.selectAll('path').remove();
        element.selectAll('linearGradient').remove();

        if(data){
            const [start] = _.first(data);
            const [top, bottom] = panel.scale.range();
            const points = data.array().map(([x, y]) => `${chart.scale(x)} ${panel.scale(y)}`).join(' L ');
            const uuid = UUID();

            const sc = Color.parse(parameters.fill);
            const ec = sc.clone();

            sc.alpha = 0.75;
            ec.alpha = 0;

            element.append('linearGradient')
                .attr('id', uuid)
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('y1', 0)
                .attr('y2', 1)
                .selectAll('stop')
                .data([{offset: '0%', color: sc.toRGBAString()}, {offset: '100%', color: ec.toRGBAString()}])
                .enter()
                    .append('stop')
                    .attr('offset', d => d.offset)
                    .attr('stop-color', d => d.color);

            element.append('path')
                .classed('fill', true)
                .attr('d', data.length > 1 ? `M ${points} V ${bottom} H ${chart.scale(start)} Z` : '')
                .attr('fill', `url(#${uuid})`);

            element.append('path')
                .classed('stroke', true)
                .attr('d', data.length > 1 ? `M ${points}` : '')
                .attr('stroke', parameters.stroke)
                .attr('stroke-width', parameters.width);
        }
    }
};
