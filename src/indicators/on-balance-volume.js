const {map} = require('via').VS;

module.exports = {
    name: 'on-balance-volume',
    title: 'On Balance Volume',
    description: 'Measures buying and selling pressure.',
    abbreviation: 'OBV',
    panel: true,
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        obv: {
            type: 'plot',
            title: 'On Balance Volume',
            parameters: {
                color: '#FFF',
                style: 'line'
            }
        }
    },
    parameters: {},
    calculate: ({series, parameters, draw}) => {
        let obv = 0;

        draw('obv', map(series, (value, index) => {
            if(index){
                const close = value.price_close;
                const previous_close = series.before(index).price_close;

                if(close !== previous_close){
                    obv += value.volume_traded * (close > previous_close ? 1 : -1);
                }
            }

            return obv;
        }));
    }
}