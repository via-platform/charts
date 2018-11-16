const {divide, prop} = require('via-script');

module.exports = {
    name: 'trade-count-ratio',
    title: 'Trade Count Ratio',
    description: 'The ratio of the number of buy trades to the number of sell trades in a given time period.',
    decimals: () => 2,
    panel: true,
    components: {
        ratio: {
            type: 'plot',
            title: 'Ratio',
            parameters: {
                color: '#FFF',
                style: 'circle'
            }
        },
        baseline: {
            type: 'horizontal-line',
            title: 'Baseline',
            trackable: false,
            parameters: {
                stroke: '#FFF',
                style: 'dashed'
            }
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
        draw('baseline', 1);
        draw('ratio', divide(prop(series, 'buy_count'), prop(series, 'sell_count')), {color: ([x, y]) => y >= 1 ? parameters.up : parameters.down});
    }
}