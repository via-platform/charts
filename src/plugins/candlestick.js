const {Disposable, CompositeDisposable} = require('via');
const d3 = require('d3');

module.exports = class Candlestick {
    constructor(chart){
        this.chart = chart;
        this.symbol = chart.symbol;
    }

    draw(){
        let x = techan.scale.financetime().range([0, this.element.offsetWidth]);
        let y = d3.scaleLinear().range([this.element.offsetHeight, 0]);

        this.chart.ui = {
            candlestick: techan.plot.candlestick().xScale(x).yScale(y),
            axis: {
                x: d3.axisBottom(x),
                y: d3.axisLeft(y).tickFormat(d3.format(",.3s"))
            }
        };

        d3.select(this.refs.candlestick).datum([]).call(this.chart.ui.candlestick);
        d3.select(this.refs.x).call(this.chart.ui.axis.x);
        d3.select(this.refs.y).call(this.chart.ui.axis.y);
    }

    async populate(){
        console.log(this.chart);
        let start = this.chart.options.start;
        let end = this.chart.options.end;

        if(!start){
            start = new Date(this.chart.options.end.getTime() - this.chart.options.chartWidth);
        }

        if(start > end){
            throw new Error(`The start date of a chart cannot be chronologically after its end date.`);
        }

        let data = await this.symbol.cache.query(start, end, this.chart.options.granularity);
        console.log('Received data');
        console.log(data);
    }

    render(){
        // let group = $('<g></g>');
        // group.append('<clipPath id="clip"></clipPath>')
        //     .append()
        //
        //
        // let clip = document.createElement('clipPath');
        // clip.id = 'clip';
        //
        // this.element = document.createElement('g');
        //
        // return <g transform="translate(50, 20)">
        //     <clipPath id="clip">
        //         <rect width="{this.element.offsetWidth}" height="{this.element.offsetHeight}"></rect>
        //     </clipPath>
        //     <g class="candlestick" clip-path="url(#clip)" ref="candlestick"></g>
        //     <g class="x axis" ref="x"></g>
        //     <g class="y axis" ref="y"></g>
        // </g>;
    }

    destroy(){}
}
