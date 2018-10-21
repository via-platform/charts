const Bar = {
    name: 'bar',
    title: 'Bar',
    parameters: {
        fill: {
            title: 'Fill Color',
            type: 'color',
            default: '#0000FF'
        },
        visible: {
            title: 'Visible',
            type: 'boolean',
            default: true
        }
    },
    render: ({chart, panel, element, data, parameters}) => {
        const bars = element.selectAll('path').data(data);

        bars.enter()
            .append('path')
            .merge(bars)
                .attr('d', Bar.body)
                .attr('fill', '#FFF');

        bars.exit().remove();
    },
    body: ([x, candle]) => {
        const w = Math.max(Math.floor(chart.bandwidth * 0.8 / 3), 1);
        const open = panel.scale(candle.price_open);
        const close = panel.scale(candle.price_close);
        const high = panel.scale(candle.price_high);
        const low = panel.scale(candle.price_low);

        return `M ${chart.scale(x) - (w / 2)} ${high - (w / 2)}
                h ${w}
                v ${close - high}
                h ${w}
                v ${w}
                h ${-w}
                V ${low + (w / 2)}
                h ${-w}
                v ${open - low}
                h ${-w}
                v ${-w},
                h ${w}
                Z`;
    }
};

module.exports = Bar;
