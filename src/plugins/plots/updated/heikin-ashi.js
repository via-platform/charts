class HeikinAshi {
    constructor({chart, panel, element}){
        this.chart = chart;
        this.panel = panel;
        this.element = element;

        this.element.classed('heikin-ashi', true);
    }


    domain(){
        let [start, end] = this.chart.scale.domain();
        let data = this.chart.data.fetch({start, end}).filter(candle => candle.price_close);

        if(data.length){
            return [ _.min(data.map(d => d.price_low)), _.max(data.map(d => d.price_high)) ];
        }
    }

    draw(){
        let [start, end] = this.chart.scale.domain();

        start.setTime(start.getTime() - this.chart.granularity);

        let data = this.chart.data.fetch({start, end}).sort((a, b) => a.time_period_start - b.time_period_start);
        this.candles = [];

        if(!data.length){
            return;
        }

        //Calculate the first candle
        let first = _.first(data);

        this.candles.push({
            time_period_start: first.time_period_start,
            price_open: (first.price_open + first.price_close) / 2,
            price_close: (first.price_open + first.price_close + first.price_high + first.price_low) / 4,
            price_high: first.price_high,
            price_low: first.price_low,
            incomplete: true
        });

        for(let i = 1; i < data.length; i++){
            let candle = data[i], previous = data[i - 1];
            let price_open = (previous.price_open + previous.price_close) / 2;
            let price_close = (candle.price_open + candle.price_close + candle.price_high + candle.price_low) / 4;

            this.candles.push({
                time_period_start: candle.time_period_start,
                price_open,
                price_close,
                price_high: Math.max(candle.price_high, price_open, price_close),
                price_low: Math.min(candle.price_low, price_open, price_close)
            });
        }

        let body = this.element.selectAll('path.candle.body')
            .data(this.candles, d => d.time_period_start.getTime())
            .attr('class', d => (d.price_open > d.price_close) ? 'candle body down' : 'candle body up')
            .classed('incomplete', d => d.incomplete)
            .attr('d', this.body);

        body.enter()
            .append('path')
            .attr('d', this.body)
            .attr('class', d => (d.price_open > d.price_close) ? 'candle body down' : 'candle body up')
            .classed('incomplete', d => d.incomplete);

        body.exit().remove();

        let wick = this.element.selectAll('path.candle.wick')
            .data(this.candles, d => d.time_period_start.getTime())
            .attr('class', d => (d.price_open > d.price_close) ? 'candle wick down' : 'candle wick up')
            .attr('d', this.wick);

        wick.enter()
            .append('path')
            .attr('class', d => (d.price_open > d.price_close) ? 'candle wick down' : 'candle wick up')
            .attr('d', this.wick);

        wick.exit().remove();
    }

    destroy(){
        this.disposables.dispose();
    }

    body(d){
        let width = Math.min(this.chart.bandwidth - 2, Math.floor(this.chart.bandwidth * (1 - this.padding) - 1));
        let x = this.chart.scale(d.time_period_start) - width / 2;
        let price_open = this.panel.scale(d.price_open);
        let price_close = this.panel.scale(d.price_close);

        if(Math.abs(price_open - price_close) < 1){
            if(price_close < price_open){
                price_close = price_open - 1;
            }else{
                price_open = price_close + 1;
            }
        }

        return `M ${x - 0.5} ${price_open} h ${width} V ${price_close} h ${-1 * width} Z`;
    }

    wick(d){
        let x = Math.round(this.chart.scale(d.time_period_start)),
            price_open = this.panel.scale(d.price_open),
            price_close = this.panel.scale(d.price_close),
            price_high = this.panel.scale(d.price_high),
            price_low = this.panel.scale(d.price_low);

        return `M ${x - 0.5} ${price_high} V ${Math.min(price_open, price_close)} M ${x - 0.5} ${Math.max(price_open, price_close)} V ${price_low}`;
    }
}

module.exports = {
    name: 'heikin-ashi',
    type: 'plot',
    settings: {},
    title: 'Heikin-Ashi Candlesticks',
    description: 'Plot Heikin-Ashi candlesticks.',
    instance: params => new HeikinAshi(params)
};
