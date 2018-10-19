const {sma, prop} = require('via').VS;

module.exports = {
    name: 'sma',
    title: 'Simple Moving Average',
    description: 'An n-period moving average.',
    components: {
        sma: {
            type: 'plot',
            style: {
                color: '#0000FF'
            }
        }
    },
    parameters: {
        property: {
            title: 'Property',
            type: 'string',
            enum: ['price_open', 'price_high', 'price_low', 'price_close', 'middle', 'average'],
            default: 'price_close'
        },
        length: {
            title: 'Length',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 15
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('sma', sma(prop(series, parameters.property), parameters.length));
    }
}