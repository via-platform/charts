module.exports = class Bar {
    constructor({chart, panel, element}){
        this.chart = chart;
        this.panel = panel;
        this.element = element;

        this.element.classed('bar', true);
    }

    draw(series, properties){
        //TODO handle properties like color / width

        const body = this.element.selectAll('path.bar').data(series, d => d.time_period_start.getTime());

        body.enter().append('path').merge(body)
            .attr('d', this.body.bind(this))
            .attr('class', d => (d.price_open > d.price_close) ? 'bar down' : 'bar up');

        body.exit().remove();

        // if(this.layer.isSelected()){
        //     let handle = this.element.selectAll('circle.handle')
        //         .data(data.filter(d => d.price_close && d.price_open && d.time_period_start.getTime() % (this.chart.granularity * 10) === 0), d => d.time_period_start.getTime())
        //         .attr('class', 'handle')
        //         .attr('cx', d => this.chart.scale(d.time_period_start))
        //         .attr('cy', d => this.panel.scale((d.price_open + d.price_close) / 2))
        //         .attr('r', 4);
        //
        //     handle.enter()
        //         .append('circle')
        //         .attr('class', 'handle')
        //         .attr('cx', d => this.chart.scale(d.time_period_start))
        //         .attr('cy', d => this.panel.scale(d3.mean([d.price_open, d.price_close])))
        //         .attr('r', 4);
        //
        //     handle.exit().remove();
        // }else{
        //     this.element.selectAll('circle.handle').remove();
        // }
    }

    body(d){
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
}
