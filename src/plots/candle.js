module.exports = class Candles {
    constructor({chart, panel, element}){
        this.chart = chart;
        this.panel = panel;
        this.element = element;

        this.element.classed('candles', true);
    }

    domain(){
        
    }

    draw(series, properties){
        //TODO handle properties like color / width

        const body = this.element.selectAll('path.candle.body').data(series, d => d.time_period_start.getTime());

        body.enter().append('path').merge(body)
            .attr('d', this.body)
            .attr('class', d => (d.price_open > d.price_close) ? 'candle body down' : 'candle body up');

        body.exit().remove();

        const wick = this.element.selectAll('path.candle.wick').data(series, d => d.time_period_start.getTime());

        wick.enter().append('path').merge(wick)
            .attr('d', this.wick)
            .attr('class', d => (d.price_open > d.price_close) ? 'candle wick down' : 'candle wick up');

        wick.exit().remove();
    }

    body(d){
        const width = Math.min(this.chart.bandwidth - 2, Math.floor(this.chart.bandwidth * (1 - this.padding) - 1));
        const x = this.chart.scale(d.time_period_start) - width / 2;
        const open = this.panel.scale(d.price_open);
        const close = this.panel.scale(d.price_close);

        return `M ${x - 0.5} ${open} h ${width} V ${close} h ${-1 * width} Z`;
    }

    wick(d){
        const x = Math.round(this.chart.scale(d.time_period_start));
        const open = this.panel.scale(d.price_open);
        const close = this.panel.scale(d.price_close);
        const high = this.panel.scale(d.price_high);
        const low = this.panel.scale(d.price_low);

        return `M ${x - 0.5} ${high} V ${Math.min(open, close)} M ${x - 0.5} ${Math.max(open, close)} V ${low}`;
    }
}
