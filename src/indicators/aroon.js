const {map, highest_bars, lowest_bars} = require('via-script');

module.exports = {
    name: 'aroon',
    title: 'Aroon',
    description: 'Measures the number of periods since an n-period high or low.',
    decimals: () => 4,
    panel: true,
    components: {
        up: {
            title: 'Aroon Up',
            type: 'plot',
            parameters: {
                color: '#f39c12',
                style: 'line'
            }
        },
        down: {
            title: 'Aroon Down',
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
            min: 2,
            max: 100,
            step: 1,
            default: 14,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        draw('up', map(highest_bars(series, parameters.length), value => 100 * (parameters.length - value) / parameters.length));
        draw('down', map(lowest_bars(series, parameters.length), value => 100 * (parameters.length - value) / parameters.length));
    }
}
