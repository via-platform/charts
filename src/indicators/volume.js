const {permute} = require('via-script');

module.exports = {
    name: 'volume',
    title: 'Trading Volume',
    description: 'A volume bar for each time period corresponding to the relative number of units traded.',
    panel: true,
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        volume: {
            type: 'stacked-bar',
            title: 'Volume',
            parameters: {}
        }
    },
    parameters: {
        up: {
            type: 'color',
            default: '#0bd691'
        },
        down: {
            type: 'color',
            default: '#ff3b30'
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('volume', permute(series, ['volume_buy', 'volume_sell']), {fill: [parameters.up, parameters.down]});
    }
}