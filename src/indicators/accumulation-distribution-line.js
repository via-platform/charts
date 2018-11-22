const {adl} = require('via-script');

module.exports = {
    name: 'accumulation-distribution-line',
    title: 'Accumulation Distribution Line',
    description: 'Measures the underlying supply and demand.',
    abbreviation: 'ADL',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    panel: true,
    components: {
        adl: {
            title: 'ADL',
            type: 'plot',
            parameters: {
                color: '#eb2f06',
                style: 'line'
            }
        }
    },
    parameters: {},
    calculate: ({series, parameters, draw}) => {
        draw('adl', adl(series));
    }
};