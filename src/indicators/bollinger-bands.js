const {sma, map, merge, multiply, add, subtract, prop, deviation} = require('via').VS;

module.exports = {
    name: 'bollinger-bands',
    title: 'Bollinger Bands',
    description: 'The n-period moving average and two bands, one standard deviation above and below the moving average.',
    components: {
        midline: {
            type: 'line',
            title: 'Bollinger Value',
            parameters: {
                stroke: '#4594eb',
                style: 'dashed',
                width: 1.5
            }
        },
        upper_band: {
            type: 'line',
            title: 'Upper Band',
            trackable: false,
            parameters: {
                stroke: '#AAAAAA',
                style: 'solid',
                width: 1.5
            }
        },
        lower_band: {
            type: 'line',
            title: 'Lower Band',
            trackable: false,
            parameters: {
                stroke: '#AAAAAA',
                style: 'solid',
                width: 1.5
            }
        },
        range: {
            type: 'range',
            title: 'Range',
            trackable: false,
            parameters: {
                fill: 'rgba(69, 148, 235, 0.1)'
            }
        }
    },
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
        length: {
            title: 'Length',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 20,
            legend: true
        },
        deviations: {
            title: 'Standard Deviation',
            type: 'integer',
            constraint: x => (x > 1 && x <= 5),
            default: 2,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        const average = sma(prop(series, parameters.property), parameters.length);
        const deviations = multiply(deviation(prop(series, parameters.property), parameters.length), parameters.deviations);
        const upper = add(average, deviations);
        const lower = subtract(average, deviations);

        draw('range', merge(upper, lower, (a, b) => [a, b]));
        draw('upper_band', upper);
        draw('lower_band', lower);
        draw('midline', average);
    }
}