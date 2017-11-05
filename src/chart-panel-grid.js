const {Disposable, CompositeDisposable, Emitter} = require('via');
const d3 = require('d3');
const TICKS = 10;

module.exports = class ChartPanelGrid {
    constructor({chart, panel}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panel = panel;

        this.grid = {
            x: this.panel.svg.append('g').attr('class', 'grid x'),
            y: this.panel.svg.append('g').attr('class', 'grid y')
        };

        this.basis = {
            x: d3.axisBottom(this.chart.scale).ticks(TICKS).tickSize(this.panel.height).tickFormat(''),
            y: d3.axisLeft(this.panel.scale).ticks(TICKS).tickSize(-this.panel.width).tickFormat('')
        };

        this.disposables.add(this.panel.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));
        this.disposables.add(this.chart.onDidZoom(this.draw.bind(this)));
    }

    resize(){
        this.basis.x.tickSize(this.panel.height);
        this.basis.y.tickSize(-this.panel.width);

        this.draw();
    }

    draw(){
        this.grid.x.call(this.basis.x);
        this.grid.y.call(this.basis.y);
    }

    destroy(){
        this.disposables.dispose();
    }
}
