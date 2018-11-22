const {prop} = require('via-script');

module.exports = {
    name: 'volume-notional',
    title: 'Notional Trading Volume',
    description: 'A volume bar for each time period corresponding to the total amount of notional volume traded.',
    panel: true,
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        volume: {
            type: 'plot',
            title: 'Notional Volume',
            parameters: {
                style: 'histogram',
                color: '#AAA'
            }
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
        draw('volume', prop(series, 'volume_notional'));
    }
};