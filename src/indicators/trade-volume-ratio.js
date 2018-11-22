const {divide, prop} = require('via-script');

module.exports = {
    name: 'trade-volume-ratio',
    title: 'Trade Volume Ratio',
    description: 'The ratio of volume bought to volume sold in a given time period.',
    decimals: () => 2,
    panel: true,
    components: {
        ratio: {
            type: 'plot',
            title: 'Ratio',
            parameters: {
                color: '#FFFFFF',
                style: 'circle'
            }
        },
        baseline: {
            type: 'horizontal-line',
            title: 'Baseline',
            trackable: false,
            parameters: {
                stroke: '#FFFFFF',
                style: 'dashed'
            }
        }
    },
    parameters: {
        up: {
            title: 'Positive Ratio Color',
            type: 'color',
            default: '#0bd691'
        },
        down: {
            title: 'Negative Ratio Color',
            type: 'color',
            default: '#ff3b30'
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('baseline', 1);
        draw('ratio', divide(prop(series, 'volume_buy'), prop(series, 'volume_sell')), {color: ([x, y]) => y >= 1 ? parameters.up : parameters.down});
    }
}