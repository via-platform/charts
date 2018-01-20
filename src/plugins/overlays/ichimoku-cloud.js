const {CompositeDisposable, Disposable} = require('via');
const d3 = require('d3');
const _ = require('underscore-plus');
const etch = require('etch');
const $ = etch.dom;

class IchimokuCloud {
    constructor({chart, state, element, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;
        this.element = element;

        //TODO customize these properties
        this.stroke = 1.5;

        this.tenkan = 9;
        this.kijun = 26;
        this.senkou = 52;
        this.displacement = 26;

        this.clouds = new Map();
        this.cache = new Map();

        this.lines = {
            tenkan: d3.line().x(d => this.chart.scale(d.date)).y(d => this.panel.scale(d.tenkan.value)).bind(this),
            kijun: d3.line().x(d => this.chart.scale(d.date)).y(d => this.panel.scale(d.kijun.value)).bind(this),
            senkouA: d3.line().x(d => this.chart.scale(d.date)).y(d => this.panel.scale(d.senkouA.value)).bind(this),
            senkouB: d3.line().x(d => this.chart.scale(d.date)).y(d => this.panel.scale(d.senkouB.value)).bind(this),
            chikou: d3.line().x(d => this.chart.scale(d.date)).y(d => this.panel.scale(d.chikou.value)).bind(this)
        };

        this.element.classed('ichimoku-cloud', true);
    }

    title(){
        return `Ichimoku Cloud (${this.tenkan}, ${this.kijun}, ${this.senkou}, ${this.displacement})`;
    }

    availability(line){
        if(!line) debugger;
        return line.available ? 'available' : 'unavailable';
    }

    value(band){
        const data = this.clouds.get(band);
        const aggregation = this.chart.symbol ? this.chart.symbol.aggregation : 2;

        if(!data){
            return $.div({classList: 'value'},
                'T', $.span({classList: 'unavailable'}, '-'),
                'K', $.span({classList: 'unavailable'}, '-'),
                'SA', $.span({classList: 'unavailable'}, '-'),
                'SB', $.span({classList: 'unavailable'}, '-'),
                'C', $.span({classList: 'unavailable'}, '-')
            );
        }

        return $.div({classList: 'value'},
            'T', $.span({classList: this.availability(data.tenkan) + ' tenkan'}, data.tenkan.value.toFixed(aggregation)),
            'K', $.span({classList: this.availability(data.kijun) + ' kijun'}, data.kijun.value.toFixed(aggregation)),
            'SA', $.span({classList: this.availability(data.senkouA) + ' senkou-a'}, data.senkouA.value.toFixed(aggregation)),
            'SB', $.span({classList: this.availability(data.senkouB) + ' senkou-b'}, data.senkouB.value.toFixed(aggregation)),
            'C', $.span({classList: this.availability(data.chikou) + ' chikou'}, data.chikou.value ? data.chikou.value.toFixed(aggregation) : '-')
        );
    }

    serialize(){
        return {
            version: 1,
            name: 'ichimoku-cloud'
        };
    }

    draw(){
        const [start, end] = this.chart.scale.domain();
        const max = Math.max(this.tenkan, this.kijun, this.senkou);

        //Shift the start over to the left, based on the displacement and the largest number of periods that we need
        start.setTime(start.getTime() - (max + this.displacement) * this.chart.granularity);

        //Shift the end over to the displacement
        end.setTime(end.getTime() + (this.displacement + 1) * this.chart.granularity);

        const data = this.chart.data.fetch({start, end}).sort((a, b) => a.date - b.date);
        let iterator = this.chart.nearestCandle(start);

        //Eventually, we might work out a caching strategy, but today is not this day
        this.clouds.clear();

        //Initialize all of the necessary cloud objects
        while(iterator <= end){
            if(!this.clouds.has(iterator.getTime())){
                this.clouds.set(iterator.getTime(), {date: new Date(iterator)});
            }

            iterator = new Date(iterator.getTime() + this.chart.granularity);
        }

        for(let i = 0; i < data.length; i++){
            const band = data[i];
            const cloud = this.clouds.get(band.date.getTime());

            if(cloud){
                cloud.high = band.high;
                cloud.low = band.low;
                cloud.close = band.close;
            }
        }

        //Reset the iterator and make a second pass through all of the dates in order to actually calculate the ichimoku values
        const all = Array.from(this.clouds.values());
        iterator = this.chart.nearestCandle(start);

        while(iterator <= end){
            const time = iterator.getTime();
            const cloud = this.clouds.get(time);

            if(cloud){
                const tenkan = all.filter(d => (d.date.getTime() >= time - ((this.tenkan - 1) * this.chart.granularity)) && d.date.getTime() <= time);
                const kijun = all.filter(d => (d.date.getTime() >= time - ((this.kijun - 1) * this.chart.granularity)) && d.date.getTime() <= time);
                const senkou = all.filter(d => (d.date.getTime() >= time - ((this.senkou - 1) * this.chart.granularity)) && d.date.getTime() <= time);
                const chikouDate = new Date(time - this.displacement * this.chart.granularity);
                const senkouDate = new Date(time + this.displacement * this.chart.granularity);

                cloud.tenkan = {available: tenkan.length === this.tenkan, value: (d3.max(tenkan, d => d.high) + d3.min(tenkan, d => d.low)) / 2};
                cloud.kijun = {available: kijun.length === this.kijun, value: (d3.max(kijun, d => d.high) + d3.min(kijun, d => d.low)) / 2};

                if(this.clouds.has(chikouDate.getTime()) && cloud.close){
                    this.clouds.get(chikouDate.getTime()).chikou = {available: true, value: cloud.close};
                }

                if(this.clouds.has(senkouDate.getTime())){
                    this.clouds.get(senkouDate.getTime()).senkouA = {available: cloud.tenkan.available && cloud.kijun.available, value: (cloud.tenkan.value + cloud.kijun.value) / 2};
                    this.clouds.get(senkouDate.getTime()).senkouB = {available: senkou.length === this.senkou, value: (d3.max(senkou, d => d.high) + d3.min(senkou, d => d.low)) / 2};
                }
            }

            iterator = new Date(iterator.getTime() + this.chart.granularity);
        }

        const clouds = Array.from(this.clouds.values());

        this.element.selectAll('path').remove();

        // this.line('tenkan').datum(all).attr('d', this.lines.tenkan);
        // this.line('kijun').datum(all).attr('d', this.lines.kijun);
        // this.line('senkou-a').datum(all).attr('d', this.lines.senkouA);
        // this.line('senkou-b').datum(all).attr('d', this.lines.senkouB);
        this.line('chikou').datum(clouds.filter(d => d.chikou && d.chikou.available)).attr('d', this.lines.chikou);
    }

    line(classes){
        return this.element.append('path')
            .attr('fill', 'none')
            .attr('class', classes)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', this.stroke);
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    title: 'Ichimoku Cloud',
    name: 'ichimoku-cloud',
    description: 'Ichimoku Cloud.',
    type: 'overlay',
    settings: {},
    instance: params => new IchimokuCloud(params)
};
