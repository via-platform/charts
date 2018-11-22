const {permute} = require('via-script');

module.exports = {
    name: 'trade-count',
    title: 'Number of Trades',
    description: 'A bar for each time period corresponding to the number of individual trades.',
    panel: true,
    decimals: () => 0,
    components: {
        count: {
            type: 'stacked-bar',
            title: 'Trade Count',
            parameters: {}
        }
    },
    parameters: {
        up: {
            title: 'Positive Color',
            type: 'color',
            default: '#0bd691'
        },
        down: {
            title: 'Negative Color',
            type: 'color',
            default: '#ff3b30'
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('count', permute(series, ['buy_count', 'sell_count']), {fill: [parameters.up, parameters.down]});
    }
}