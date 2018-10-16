const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');

const AXIS_HEIGHT = 22;
const FLAG_HEIGHT = AXIS_HEIGHT - 3;

class ShadowValue {
    constructor({chart}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = this.chart.center();
        this.flag = this.panel.axis.flag().classed('shadow-value-flag', true);
        this.line = this.panel.svg.append('path').attr('class', 'shadow-value').attr('d', `M 0 0 h ${this.panel.width}`);

        this.disposables.add(this.chart.onDidChangeGroup(this.regroup.bind(this)));
        this.disposables.add(this.panel.onDidDraw(this.draw.bind(this)));
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));
    }

    regroup(){
        if(this.groupDisposables){
            this.groupDisposables.dispose();
        }

        if(this.chart.group){
            this.groupDisposables = this.chart.group.onDidChangeHover(this.draw.bind(this));
        }

        this.draw();
    }

    resize(){
        this.line.attr('d', `M 0 0 h ${this.panel.width}`);
    }

    draw(){
        if(this.chart.group){
            if(this.chart.group.hover){
                const y = Math.round(this.panel.scale(this.chart.group.hover));

                this.line.classed('hidden', false).attr('transform', `translate(0, ${y - 0.5})`);

                this.flag.classed('hidden', false)
                    .attr('transform', `translate(0, ${y - Math.ceil(FLAG_HEIGHT / 2)})`)
                    .select('text').text(this.chart.group.hover.toFixed(this.chart.precision));
            }else{
                this.line.classed('hidden', true);
                this.flag.classed('hidden', true);
            }
        }
    }

    destroy(){
        if(this.groupDisposables){
            this.groupDisposables.dispose();
        }

        this.disposables.dispose();
    }
}

module.exports = {
    name: 'shadow-value',
    type: 'other',
    settings: {},
    title: 'Shadow Value',
    description: 'Shows the corresponding value on the chart when you hover over price levels in another component.',
    instance: params => new ShadowValue(params)
};
