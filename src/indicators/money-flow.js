const {subtract, divide, multiply, prop} = require('via').VS;

module.exports = {
    name: 'money-flow',
    title: 'Money Flow',
    description: 'An oscillator designed to measure buying and selling pressure.',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    panel: true,
    components: {
        mf: {
            type: 'plot',
            parameters: {
                color: '#0bd691',
                style: 'line'
            }
        }
    },
    parameters: {},
    calculate: ({series, parameters, draw}) => {
        const mf = multiply(prop(series, 'hlc_average'), prop(series, 'volume_traded'));

        //For each item in the sequence
            //For the previous 14 items
                //If item > previous
                    //Add to total


        draw('mf', map(divide(positive, negative), value => 100 - 100 / (1 + value)));
    }
}
