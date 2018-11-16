const {subtract, map, tr, prop, divide, sum} = require('via').VS;

module.exports = {
    name: 'ultimate-oscillator',
    title: 'Ultimate Oscillator',
    abbreviation: 'UO',
    description: 'Measures market momentum across three varying timeframes.',
    decimals: () => 2,
    panel: true,
    components: {
        uo: {
            type: 'plot',
            parameters: {
                color: '#f1c40f',
                style: 'line'
            }
        }
    },
    parameters: {
        fast: {
            title: 'Fast Length',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 7,
            legend: true
        },
        medium: {
            title: 'Medium Length',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 14,
            legend: true
        },
        slow: {
            title: 'Slow Length',
            type: 'number',
            constraint: x => (x > 1 && x <= 200),
            default: 28,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        const buying_pressure = subtract(
            prop(series, 'price_close'),
            map(series, (value, index) => index ? Math.min(value.price_low, series.before(index).price_close) : value.price_low)
        );

        const true_range = tr(series);
        const average_fast = divide(sum(buying_pressure, parameters.fast), sum(true_range, parameters.fast));
        const average_medium = divide(sum(buying_pressure, parameters.medium), sum(true_range, parameters.medium));
        const average_slow = divide(sum(buying_pressure, parameters.slow), sum(true_range, parameters.slow));

        draw('uo', map(average_fast, (value, index) => 100 / 7 * (4 * average_fast.get(index) + 2 * average_medium.get(index) + average_slow.get(index))));
    }
}
