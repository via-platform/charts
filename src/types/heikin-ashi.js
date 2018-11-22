module.exports = {
    name: 'heikin-ashi',
    title: 'Heikin-Ashi',
    description: 'Plot Heikin-Ashi candlesticks.',
    parameters: {
        up: {
            title: 'Up Candle Color',
            type: 'color',
            default: '#0bd691'
        },
        down: {
            title: 'Down Candle Color',
            type: 'color',
            default: '#ff3b30'
        }
    },
    calculate: ({series}) => {
        let last = {};

        return series.map((value, index) => {
            const price_open = index ? (last.price_open + last.price_close) / 2 : (value.price_open + value.price_close) / 2;
            const price_close = value.average;
            const price_high = index ? Math.max(value.price_high, price_open, price_close) : value.price_high;
            const price_low = index ? Math.min(value.price_low, price_open, price_close) : value.price_low;
            const middle = (price_high + price_low) / 2;
            const average = (price_open + price_close + price_high + price_low) / 4;

            return last = {price_open, price_close, price_high, price_low, average, middle};
        });
    },
    domain: series => {
        return series.length ? [series.prop('price_low').min(), series.prop('price_high').max()] : [];
    },
    render: ({chart, panel, element, data, parameters}) => {
        if(data){
            const body = element.selectAll('path.body').data(data);
            const wick = element.selectAll('path.wick').data(data);

            let width = Math.max(Math.floor(chart.bandwidth * 0.8), 1);

            if(width % 2 === 0){
                width -= 1;
            }

            body.enter()
                    .append('path')
                .merge(body)
                    .attr('d', ([x, candle]) => {
                        const open = Math.ceil(panel.scale(candle.price_open));
                        const close = Math.floor(panel.scale(candle.price_close));
                        const start = Math.round(chart.scale(x) - ((width + 1) / 2));

                        return `M ${start} ${open} h ${width} V ${(open === close) ? close - 1 : close} h ${-1 * width} Z`;
                    })
                    .attr('class', 'body')
                    .attr('fill', ([x, candle]) => (candle.price_open <= candle.price_close) ? parameters.up : parameters.down);

            wick.enter()
                    .append('path')
                .merge(wick)
                    .attr('d', ([x, candle]) => {
                        const open = Math.ceil(panel.scale(candle.price_open));
                        const close = Math.floor(panel.scale(candle.price_close));
                        const high = Math.ceil(panel.scale(candle.price_high));
                        const low = Math.floor(panel.scale(candle.price_low));
                        const start = Math.round(chart.scale(x)) - 0.5;

                        return `M ${start} ${high} V ${Math.min(open, close)} M ${start} ${Math.max(open, close)} V ${low}`;
                    })
                    .attr('class', 'wick')
                    .attr('stroke', ([x, candle]) => (candle.price_open <= candle.price_close) ? parameters.up : parameters.down)
                    .attr('stroke-width', '1');

            body.exit().remove();
            wick.exit().remove();
        }else{
            element.selectAll('path.body, path.wick').remove();
        }
    }
};
