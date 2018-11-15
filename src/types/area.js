const {Color} = require('via');
const {prop} = require('via-script');
const _ = require('underscore-plus');

module.exports = {
    name: 'area',
    title: 'Area',
    parameters: {
        property: {
            title: 'Property',
            type: 'string',
            enum: [
                {title: 'Open', value: 'price_open'},
                {title: 'High', value: 'price_high'},
                {title: 'Low', value: 'price_low'},
                {title: 'Close', value: 'price_close'},
                {title: 'High-Low Average', value: 'hl_average'},
                {title: 'OHLC Average', value: 'ohlc_average'}
            ],
            default: 'price_close'
        },
        stroke: {
            title: 'Stroke Color',
            type: 'color',
            default: '#4594eb'
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
        return prop(series, parameters.property);
    },
    domain: series => {
        return series.length ? [series.min(), series.max()] : [];
    },
    render: ({chart, panel, element, data, parameters}) => {
        element.selectAll('path.area, path.line').remove();

        if(data){
            const [start] = _.first(data);
            const [top, bottom] = panel.scale.range();
            const points = data.array().map(([x, y]) => `${Math.round(chart.scale(x))} ${panel.scale(y)}`).join(' L ');
            const fill = Color.parse(parameters.fill);

            fill.alpha = 0.25;

            element.append('path')
                .classed('area', true)
                .attr('d', data.length > 1 ? `M ${points} V ${bottom} H ${chart.scale(start)} Z` : '')
                .attr('fill', fill.toRGBAString());

            element.append('path')
                .classed('line', true)
                .attr('d', data.length > 1 ? `M ${points}` : '')
                .attr('stroke', parameters.stroke)
                .attr('stroke-width', parameters.width);
        }
    }
};
