const Candle = {
    name: 'candle',
    title: 'Candlesticks',
    parameters: {
        upColor: {
            title: 'Up Candle Color',
            type: 'color',
            default: '#0000FF'
        },
        downColor: {
            title: 'Down Candle Color',
            type: 'color',
            default: '#0000FF'
        },
        stroke: {
            title: 'Stroke Color',
            type: 'color',
            default: 'rgba(0, 0, 0, 0)'
        },
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        }
    },
    render: ({chart, panel, element, data, parameters, options}) => {
        if(data){
            const body = element.selectAll('path.body').data(data);
            const wick = element.selectAll('path.wick').data(data);

            body.enter()
                    .append('path')
                .merge(body)
                    .attr('d', Candle.body)
                    .attr('class', 'body');

            wick.enter()
                    .append('path')
                .merge(wick)
                    .attr('d', Candle.wick)
                    .attr('class', 'wick');

            body.exit().remove();
            wick.exit().remove();
        }else{
            element.selectAll('path').remove();
        }
    },
    body: ([x, candle]) => {
        const width = Math.min(chart.bandwidth - 2, Math.floor(chart.bandwidth * (1 - padding) - 1));
        const open = panel.scale(candle.price_open);
        const close = panel.scale(candle.price_close);

        return `M ${chart.scale(x) - (width / 2) - 0.5} ${open} h ${width} V ${close} h ${-1 * width} Z`;
    },
    wick: ([x, candle]) => {
        const open = panel.scale(candle.price_open);
        const close = panel.scale(candle.price_close);
        const high = panel.scale(candle.price_high);
        const low = panel.scale(candle.price_low);

        return `M ${Math.round(chart.scale(x)) - 0.5} ${high} V ${Math.min(open, close)} M ${x - 0.5} ${Math.max(open, close)} V ${low}`;
    }
};

module.exports = Candle;