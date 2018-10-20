module.exports = {
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
        const bands = element.selectAll('rect').data(data);

        bands.enter()
            .append('rect')
            .merge(bands)
                .attr('x', ([x]) => chart.scale(x))
                .attr('y', 0)
                .attr('width', chart.bandwidth)
                .attr('height', panel.height);

        bands.exit().remove();
    },
    body: (d) => {
        let w = Math.max((this.chart.bandwidth - (2 * this.padding)) / 3, 1),
            x = this.chart.scale(d.time_period_start),
            open = this.panel.scale(d.price_open),
            close = this.panel.scale(d.price_close),
            high = this.panel.scale(d.price_high),
            low = this.panel.scale(d.price_low),
            oc = Math.max(low + w / 2, Math.min(high - w / 2, open)),
            cc = Math.max(low + w / 2, Math.min(high - w / 2, close));

        return `M ${x - w / 2} ${high - w / 2}
                h ${w}
                v ${close - high}
                h ${w}
                v ${w}
                h ${-w}
                V ${low + w / 2}
                h ${-w}
                v ${open - low}
                h ${-w}
                v ${-w},
                h ${w}
                Z`;
    }
};
