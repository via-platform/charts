const {sma, map, merge, multiply, add, subtract, prop, deviation} = require('via-script');

module.exports = {
    name: 'bollinger-bands',
    title: 'Bollinger Bands',
    description: 'The n-period moving average and two bands, one standard deviation above and below the moving average.',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        midline: {
            type: 'line',
            title: 'Bollinger Midline',
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
                fill: '#4594eb',
                opacity: 10
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
            min: 2,
            max: 200,
            step: 1,
            default: 20,
            legend: true
        },
        deviations: {
            title: 'Standard Deviations',
            type: 'number',
            min: 2,
            max: 5,
            step: 1,
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