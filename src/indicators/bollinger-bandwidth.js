const {sma, divide, multiply, prop, deviation} = require('via-script');

module.exports = {
    name: 'bollinger-bandwidth',
    title: 'Bollinger Bandwidth',
    description: 'The n-period moving average and two bands, one standard deviation above and below the moving average.',
    abbreviation: 'BBW',
    panel: true,
    decimals: () => 4,
    components: {
        bandwidth: {
            title: 'Bollinger Value',
            type: 'plot',
            parameters: {
                style: 'line',
                color: '#16a085'
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
            type: 'integer',
            min: 2,
            max: 5,
            step: 1,
            default: 2,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        const average = sma(prop(series, parameters.property), parameters.length);
        const deviations = multiply(deviation(prop(series, parameters.property), parameters.length), parameters.deviations * 2);

        draw('bandwidth', divide(deviations, average));
    }
}