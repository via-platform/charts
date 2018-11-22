const {subtract, divide, prop, multiply, sum} = require('via-script');

module.exports = {
    name: 'chaikin-money-flow',
    title: 'Chaikin Money Flow',
    abbreviation: 'CMF',
    description: 'Measures money flow volume over a set period of time.',
    decimals: () => 4,
    panel: true,
    components: {
        cmf: {
            title: 'Chaikin Money Flow',
            type: 'plot',
            parameters: {
                color: '#eb2f06',
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
            default: 21,
            legend: true
        }
    },
    calculate: ({series, parameters, draw}) => {
        const volume = prop(series, 'volume_traded');
        const mfv = multiply(mfm(series), volume);

        draw('cmf', divide(sum(mfv, parameters.length), sum(volume, parameters.length)));
    }
}
