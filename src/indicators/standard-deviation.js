const {deviation, prop} = require('via').VS;

module.exports = {
    name: 'standard-deviation',
    title: 'Standard Deviation',
    description: 'The standard deviation of the value over n-periods.',
    abbreviation: 'STDEV',
    decimals: () => 2,
    panel: true,
    components: {
        stdev: {
            type: 'plot',
            parameters: {
                color: '#FFF',
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
            constraint: x => (x > 1 && x <= 200),
            default: 20,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('stdev', deviation(prop(series, parameters.property), parameters.length));
    }
}