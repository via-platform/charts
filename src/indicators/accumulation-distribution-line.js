const {subtract, divide, multiply, prop} = require('via').VS;

module.exports = {
    name: 'accumulation-distribution-line',
    title: 'Accumulation Distribution Line',
    description: 'Measures the underlying supply and demand.',
    abbreviation: 'ADL',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    panel: true,
    components: {
        adl: {
            type: 'plot',
            parameters: {
                color: '#eb2f06',
                style: 'line'
            }
        }
    },
    parameters: {},
    calculate: ({series, parameters, draw}) => {
        const high = prop(series, 'price_high');
        const low = prop(series, 'price_low');
        const high = prop(series, 'price_close');

        draw('adl',
            multiply(
                divide(
                    subtract(subtract(close, low), subtract(high, close)),
                    subtract(high, low)
                ),
                prop(series, 'volume_traded')
            )
        );
    }
}
