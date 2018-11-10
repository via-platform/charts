const {subtract, divide, prop, multiply, sum} = require('via').VS;

module.exports = {
    name: 'chaikin-money-flow',
    title: 'Chaikin Money Flow',
    abbreviation: 'CMF',
    description: 'Measures money flow volume over a set period of time.',
    decimals: () => 4,
    panel: true,
    components: {
        cmf: {
            type: 'plot',
            parameters: {
                color: '#eb2f06',
                style: 'line'
            }
        }
    },
    parameters: {
        length: {
            title: 'Length',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 21
        }
    },
    calculate: ({series, parameters, draw}) => {
        const high = prop(series, 'price_high');
        const low = prop(series, 'price_low');
        const close = prop(series, 'price_close');
        const volume = prop(series, 'volume_traded');

        const mfm = divide(
            subtract(
                subtract(close, low),
                subtract(high, close)
            ),
            subtract(high, low)
        );

        const mfv = multiply(mfm, volume);

        draw('cmf', divide(sum(mfv, parameters.length), sum(volume, parameters.length)));
    }
}
