const {prop} = require('via-script');

module.exports = {
    name: 'line',
    title: 'Line',
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
            default: '#FFF'
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
    render: ({chart, panel, element, data, parameters, selected}) => {
        element.selectAll('path.line').remove();

        if(data){
            const points = data.array().map(([x, y]) => `${chart.scale(x)} ${panel.scale(y)}`).join(' L ');

            element.append('path')
                .attr('class', 'line')
                .attr('d', `M ${points}`)
                .attr('stroke', parameters.stroke)
                .attr('stroke-width', parameters.width);
        }
    }
};