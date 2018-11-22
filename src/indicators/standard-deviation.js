const {deviation, prop} = require('via-script');

module.exports = {
    name: 'standard-deviation',
    title: 'Standard Deviation',
    description: 'The standard deviation of the value over n-periods.',
    abbreviation: 'STDEV',
    decimals: () => 2,
    panel: true,
    components: {
        stdev: {
            title: 'Standard Deviation',
            type: 'plot',
            parameters: {
                color: '#FFFFFF',
                style: 'line'
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
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('stdev', deviation(prop(series, parameters.property), parameters.length));
    }
}