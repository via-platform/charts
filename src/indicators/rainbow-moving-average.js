const {d3} = require('via');
const {sma, wma, ema, rma, prop} = require('via-script');

module.exports = {
    name: 'rainbow-moving-average',
    title: 'Rainbow Moving Average',
    description: 'A collection of moving averages of various lengths.',
    abbreviation: 'Rainbow',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        plot_0: {title: 'MA 1', type: 'plot', parameters: {style: 'line'}},
        plot_1: {title: 'MA 2', type: 'plot', parameters: {style: 'line'}},
        plot_2: {title: 'MA 3', type: 'plot', parameters: {style: 'line'}},
        plot_3: {title: 'MA 4', type: 'plot', parameters: {style: 'line'}},
        plot_4: {title: 'MA 5', type: 'plot', parameters: {style: 'line'}},
        plot_5: {title: 'MA 6', type: 'plot', parameters: {style: 'line'}},
        plot_6: {title: 'MA 7', type: 'plot', parameters: {style: 'line'}},
        plot_7: {title: 'MA 8', type: 'plot', parameters: {style: 'line'}},
        plot_8: {title: 'MA 9', type: 'plot', parameters: {style: 'line'}},
        plot_9: {title: 'MA 10', type: 'plot', parameters: {style: 'line'}}
    },
    parameters: {
        property: {
            title: 'Property',
            type: 'string',
            enum: [
                {title: 'Open', value: 'price_open'},
                {title: 'High', value: 'price_high'},
                {title: 'Low', value: 'price_low'},
                {title: 'Close', value: 'price_close'},
                {title: 'High-Low Average', value: 'hl_average'},
                {title: 'OHLC Average', value: 'ohlc_average'}
            ],
            default: 'price_close'
        },
        average: {
            title: 'Average',
            type: 'string',
            enum: [
                {title: 'SMA', value: 'sma'},
                {title: 'EMA', value: 'ema'},
                {title: 'WMA', value: 'wma'},
                {title: 'RMA', value: 'rma'}
            ],
            default: 'sma'
        },
        length_0: {title: 'Length 1', type: 'number', min: 2, max: 200, step: 1, default: 8, legend: true},
        length_1: {title: 'Length 2', type: 'number', min: 2, max: 200, step: 1, default: 10, legend: true},
        length_2: {title: 'Length 3', type: 'number', min: 2, max: 200, step: 1, default: 12, legend: true},
        length_3: {title: 'Length 4', type: 'number', min: 2, max: 200, step: 1, default: 14, legend: true},
        length_4: {title: 'Length 5', type: 'number', min: 2, max: 200, step: 1, default: 16, legend: true},
        length_5: {title: 'Length 6', type: 'number', min: 2, max: 200, step: 1, default: 18, legend: true},
        length_6: {title: 'Length 7', type: 'number', min: 2, max: 200, step: 1, default: 20, legend: true},
        length_7: {title: 'Length 8', type: 'number', min: 2, max: 200, step: 1, default: 25, legend: true},
        length_8: {title: 'Length 9', type: 'number', min: 2, max: 200, step: 1, default: 30, legend: true},
        length_9: {title: 'Length 10', type: 'number', min: 2, max: 200, step: 1, default: 35, legend: true}
    },
    calculate: ({series, parameters, draw}) => {
        const averages = {sma, ema, wma, rma};
        const property = prop(series, parameters.property);

        const color = d3.scaleOrdinal()
            .domain(d3.range(10))
            .range(d3.quantize(d3.interpolateCool, 10));

        for(let i = 0; i < 10; i++){
            draw(`plot_${i}`, averages[parameters.average](property, parameters[`length_${i}`]), {color: () => color(i)});
        }
    }
}