const {d3} = require('via');
const {sma, wma, ema, rma, prop} = require('via-script');

module.exports = {
    name: 'rainbow-moving-average',
    title: 'Rainbow Moving Average',
    description: 'A collection of moving averages of various lengths.',
    abbreviation: 'Rainbow',
    decimals: chart => chart.market ? chart.market.precision.price : 0,
    components: {
        plot_0: {type: 'plot', parameters: {style: 'line'}},
        plot_1: {type: 'plot', parameters: {style: 'line'}},
        plot_2: {type: 'plot', parameters: {style: 'line'}},
        plot_3: {type: 'plot', parameters: {style: 'line'}},
        plot_4: {type: 'plot', parameters: {style: 'line'}},
        plot_5: {type: 'plot', parameters: {style: 'line'}},
        plot_6: {type: 'plot', parameters: {style: 'line'}},
        plot_7: {type: 'plot', parameters: {style: 'line'}},
        plot_8: {type: 'plot', parameters: {style: 'line'}},
        plot_9: {type: 'plot', parameters: {style: 'line'}},
        plot_10: {type: 'plot', parameters: {style: 'line'}},
        plot_11: {type: 'plot', parameters: {style: 'line'}},
        plot_12: {type: 'plot', parameters: {style: 'line'}},
        plot_13: {type: 'plot', parameters: {style: 'line'}},
        plot_14: {type: 'plot', parameters: {style: 'line'}},
        plot_15: {type: 'plot', parameters: {style: 'line'}}
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
        length_0: {title: 'Length 1', type: 'number', constraint: x => (x > 1 && x <= 200), default: 8, legend: true},
        length_1: {title: 'Length 2', type: 'number', constraint: x => (x > 1 && x <= 200), default: 10, legend: true},
        length_2: {title: 'Length 3', type: 'number', constraint: x => (x > 1 && x <= 200), default: 12, legend: true},
        length_3: {title: 'Length 4', type: 'number', constraint: x => (x > 1 && x <= 200), default: 14, legend: true},
        length_4: {title: 'Length 5', type: 'number', constraint: x => (x > 1 && x <= 200), default: 16, legend: true},
        length_5: {title: 'Length 6', type: 'number', constraint: x => (x > 1 && x <= 200), default: 18, legend: true},
        length_6: {title: 'Length 7', type: 'number', constraint: x => (x > 1 && x <= 200), default: 20, legend: true},
        length_7: {title: 'Length 8', type: 'number', constraint: x => (x > 1 && x <= 200), default: 25, legend: true},
        length_8: {title: 'Length 9', type: 'number', constraint: x => (x > 1 && x <= 200), default: 30, legend: true},
        length_9: {title: 'Length 10', type: 'number', constraint: x => (x > 1 && x <= 200), default: 35, legend: true},
        length_10: {title: 'Length 11', type: 'number', constraint: x => (x > 1 && x <= 200), default: 40, legend: true},
        length_11: {title: 'Length 12', type: 'number', constraint: x => (x > 1 && x <= 200), default: 45, legend: true},
        length_12: {title: 'Length 13', type: 'number', constraint: x => (x > 1 && x <= 200), default: 50, legend: true},
        length_13: {title: 'Length 14', type: 'number', constraint: x => (x > 1 && x <= 200), default: 60, legend: true},
        length_14: {title: 'Length 15', type: 'number', constraint: x => (x > 1 && x <= 200), default: 80, legend: true},
        length_15: {title: 'Length 16', type: 'number', constraint: x => (x > 1 && x <= 200), default: 100, legend: true}
    },
    calculate: ({series, parameters, draw}) => {
        const averages = {sma, ema, wma, rma};
        const property = prop(series, parameters.property);

        const color = d3.scaleOrdinal()
            .domain(d3.range(16))
            .range(d3.quantize(d3.interpolateCool, 16));

        for(let i = 0; i < 16; i++){
            draw(`plot_${i}`, averages[parameters.average](property, parameters[`length_${i}`]), {color: () => color(i)});
        }
    }
}