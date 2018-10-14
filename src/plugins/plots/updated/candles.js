module.exports = class Line {
    constructor({chart, panel, element}){
        this.chart = chart;
        this.panel = panel;
        this.line = element.append('path').classed('stroke', true);
    }

    draw(series, properties){
        //TODO handle properties like color / width
        this.line.datum(series).attr('d', this.stroke.bind(this));
    }

    stroke(data){
        return data.length > 1 ? 'M' + data.map(([x, y]) => `${this.chart.scale(x)} ${this.panel.scale(y)}`).join(' L ') : '';
    }

    draw(){
        const [start, end] = this.chart.scale.domain();
        const data = this.chart.data.fetch({start, end}).filter(candle => candle.price_close).sort((a, b) => a.time_period_start - b.time_period_start);

        const body = this.element.selectAll('path.candle.body').data(data, d => d.time_period_start.getTime());

        body.enter().append('path').merge(body)
            .attr('d', this.body)
            .attr('class', d => {
                if(d.trades_count === 0){
                    return 'candle body empty';
                }else if(d.price_open === d.price_close){
                    return 'candle body unchanged';
                }else{
                    return (d.price_open > d.price_close) ? 'candle body down' : 'candle body up';
                }
            });

        body.exit().remove();

        const wick = this.element.selectAll('path.candle.wick').data(data, d => d.time_period_start.getTime());

        wick.enter().append('path').merge(wick)
            .attr('d', this.wick)
            .attr('class', d => {
                if(d.trades_count === 0){
                    return 'candle wick empty';
                }else if(d.price_open === d.price_close){
                    return 'candle wick unchanged';
                }else{
                    return (d.price_open > d.price_close) ? 'candle wick down' : 'candle wick up';
                }
            });

        wick.exit().remove();
    }

    destroy(){
        this.disposables.dispose();
    }

    body(d){
        const width = Math.min(this.chart.bandwidth - 2, Math.floor(this.chart.bandwidth * (1 - this.padding) - 1));
        const x = this.chart.scale(d.time_period_start) - width / 2;
        let open = this.panel.scale(d.price_open);
        let close = this.panel.scale(d.price_close);

        if(Math.abs(open - close) < 1){
            if(close < open){
                close = open - 1;
            }else{
                open = close + 1;
            }
        }

        return `M ${x - 0.5} ${open} h ${width} V ${close} h ${-1 * width} Z`;
    }

    wick(d){
        const x = Math.round(this.chart.scale(d.time_period_start)),
            open = this.panel.scale(d.price_open),
            close = this.panel.scale(d.price_close),
            high = this.panel.scale(d.price_high),
            low = this.panel.scale(d.price_low);

        return `M ${x - 0.5} ${high} V ${Math.min(open, close)} M ${x - 0.5} ${Math.max(open, close)} V ${low}`;
    }
}