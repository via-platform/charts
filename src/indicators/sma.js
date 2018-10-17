const {sma, prop} = require('via').VS;

module.exports = class SMA {
    static metadata(){
        return {
            name: 'sma',
            type: 'overlay',
            title: 'Simple Moving Average',
            description: 'An n-period moving average.',
            components: {
                default: 'plot'
            },
            params: {
                property: {
                    title: 'Property',
                    type: 'string',
                    enum: ['open', 'high', 'low', 'close', 'mid', 'average'],
                    default: 'close'
                },
                length: {
                    title: 'Length',
                    type: 'number',
                    constraint: x => (x > 1 && x <= 200),
                    default: 15
                }
            }
        };
    }

    calculate(layer){
        layer.plot(sma(prop(layer.param('property')), layer.param('length')));
    }
}