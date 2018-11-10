const {map, highest_bars, lowest_bars} = require('via').VS;

module.exports = {
    name: 'aroon',
    title: 'Aroon',
    description: 'Measures the number of periods since an n-period high or low.',
    decimals: () => 4,
    panel: true,
    components: {
        up: {
            type: 'plot',
            parameters: {
                color: '#f39c12',
                style: 'line'
            }
        },
        down: {
            type: 'plot',
            parameters: {
                color: '#4594eb',
                style: 'line'
            }
        }
    },
    parameters: {
        length: {
            title: 'Length',
            type: 'number',
            constraint: x => (x > 1 && x <= 100),
            default: 14
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('up', map(highest_bars(series, parameters.length), value => 100 * (parameters.length - value) / parameters.length));
        draw('down', map(lowest_bars(series, parameters.length), value => 100 * (parameters.length - value) / parameters.length));
    }
}
