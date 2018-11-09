const {vwap} = require('via').VS;

module.exports = {
    name: 'vwap',
    title: 'Volume Weighted Average Price',
    description: 'The volume weighted average price of trades executed during a period.',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        vwap: {
            type: 'plot',
            parameters: {
                color: '#8e44ad',
                style: 'line'
            }
        }
    },
    parameters: {},
    calculate: ({series, parameters, draw}) => {
        draw('vwap', vwap(series));
    }
}