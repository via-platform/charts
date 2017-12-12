const {Disposable, CompositeDisposable, Emitter} = require('via');
const d3 = require('d3');
const DEFAULT_TICKS = 10;

//TODO Allow this to be customizable
const TICK_SPACING = 100;

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
            x: d3.axisBottom(this.chart.scale).ticks(DEFAULT_TICKS).tickSize(this.panel.height).tickFormat('').tickSizeOuter(0),
            y: d3.axisLeft(this.panel.scale).ticks(DEFAULT_TICKS).tickSize(-this.panel.width).tickFormat('').tickSizeOuter(0)
        };

        this.disposables.add(this.panel.onDidDestroy(this.destroy.bind(this)));
        this.disposables.add(this.panel.onDidResize(this.resize.bind(this)));
        this.disposables.add(this.chart.onDidZoom(this.draw.bind(this)));
    }

    resize(){
        this.basis.x.tickSize(this.panel.height).ticks(Math.floor(this.panel.width / TICK_SPACING)).tickSizeOuter(0);
        this.basis.y.tickSize(-this.panel.width).ticks(Math.floor(this.panel.height / TICK_SPACING)).tickSizeOuter(0);

        this.draw();
    }

    draw(){
        this.grid.x.call(this.basis.x);
        this.grid.y.call(this.basis.y);

        this.grid.y.selectAll('.tick').filter(d => this.panel.scale(d) < 5).remove();
    }

    destroy(){
        this.disposables.dispose();
    }
}
