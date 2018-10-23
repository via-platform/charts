const Bar = {
    name: 'bar',
    title: 'Bars',
    parameters: {
        fill: {
            title: 'Fill Color',
            type: 'color',
            default: '#0000FF'
        }
    },
    render: ({chart, panel, element, data, parameters}) => {
        const bars = element.selectAll('path').data(data);

        bars.enter()
            .append('path')
            .merge(bars)
                .attr('d', ([x, candle]) => {
                    const start = Math.round(chart.scale(x));

                    let open = Math.ceil(panel.scale(candle.price_open));
                    let close = Math.floor(panel.scale(candle.price_close));
                    let high = Math.ceil(panel.scale(candle.price_high));
                    let low = Math.floor(panel.scale(candle.price_low));
                    let width = Math.max(Math.floor(chart.bandwidth * 0.8 / 3), 1);

                    if(width % 2 === 0){
                        width -= 1;
                    }

                    if(high - low < width){
                        high += ((width + 1) / 2);
                        low += ((width + 1) / 2);
                    }

                    if(open + (width + 1 / 2) > high){
                        open = high + ((width + 1) / 2);
                    }

                    if(close - (width + 1 / 2) < low){
                        close = low - ((width + 1) / 2);
                    }

                    return `M ${start - ((width + 1) / 2)} ${high}
                            h ${width}
                            v ${close - high + ((width + 1) / 2)}
                            h ${width}
                            v ${width}
                            h ${-width}
                            V ${low + ((width + 1) / 2)}
                            h ${-width}
                            v ${open - low + ((width + 1) / 2)}
                            h ${-width}
                            v ${-width},
                            h ${width}
                            Z`;
                })
                .attr('fill', '#FFF');

        bars.exit().remove();
    }
};

module.exports = Bar;
