const {subtract, divide, prop} = require('via').VS;

module.exports = {
    name: 'balance-of-power',
    title: 'Balance of Power',
    description: 'Measures the market strength of buyers against sellers.',
    decimals: () => 4,
    components: {
        balance: {
            type: 'plot',
            parameters: {
                color: '#eb2f06',
                style: 'line'
            }
        }
    },
    parameters: {},
    calculate: ({series, parameters, draw}) => {
        draw('balance',
            divide(
                subtract(
                    prop(series, 'price_close'),
                    prop(series, 'price_open')
                ),
                subtract(
                    prop(series, 'price_high'),
                    prop(series, 'price_low')
                )
            )
        );
    }
}
