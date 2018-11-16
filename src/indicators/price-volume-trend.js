const {map} = require('via').VS;

module.exports = {
    name: 'price-volume-trend',
    title: 'Price Volume Trend',
    description: 'Measures money flow.',
    abbreviation: 'PVT',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    panel: true,
    components: {
        pvt: {
            type: 'plot',
            title: 'Price Volume Trend',
            parameters: {
                color: '#FFF',
                style: 'line'
            }
        }
    },
    parameters: {},
    calculate: ({series, parameters, draw}) => {
        let pvt = 0;

        draw('pvt', map(series, (value, index) => {
            if(index){
                const close = value.price_close;
                const previous_close = series.before(index).price_close;

                pvt += (close - previous_close) / previous_close * value.volume_traded;
            }

            return pvt;
        }));
    }
}