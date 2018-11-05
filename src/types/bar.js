const Bar = {
    name: 'bar',
    title: 'Bars',
    parameters: {
        up: {
            title: 'Up Bar Color',
            type: 'color',
            default: '#0bd691'
        },
        down: {
            title: 'Down Bar Color',
            type: 'color',
            default: 'rgb(255, 59, 48)'
        }
    },
    domain: series => {
        return series.length ? [series.prop('price_low').min(), series.prop('price_high').max()] : [];
    },
    render: ({chart, panel, element, data, parameters}) => {
        if(data){
            let width = Math.max(Math.floor(chart.bandwidth * 0.8 / 3), 1);

            if(width % 2 === 0){
                width -= 1;
            }

            const half = (width + 1) / 2;
            const bars = element.selectAll('path.bar').data(data);

            bars.enter()
                .append('path')
                .merge(bars)
                    .attr('class', 'bar')
                    .attr('d', ([x, candle]) => {
                        const start = Math.round(chart.scale(x));
                        const open = Math.round(panel.scale(candle.price_open));
                        const close = Math.round(panel.scale(candle.price_close));
                        const high = Math.round(panel.scale(candle.price_high));
                        const low = Math.round(panel.scale(candle.price_low));

                        return `M ${start - half} ${high - half}
                                h ${width}
                                V ${close - half}
                                h ${width}
                                v ${width}
                                h ${-1 * width}
                                V ${low + half}
                                h ${-1 * width}
                                V ${open + half}
                                h ${-1 * width}
                                v ${-1 * width}
                                h ${width}
                                Z`;
                    })
                    .attr('fill', ([x, candle]) => (candle.price_open <= candle.price_close) ? parameters.up : parameters.down);

            bars.exit().remove();
        }else{
            element.selectAll('path.bar').remove();
        }
    }
};

module.exports = Bar;
