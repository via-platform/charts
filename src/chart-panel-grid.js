const {Disposable, CompositeDisposable, Emitter, d3} = require('via');
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

        // this.disposables.add(this.panel.onDidDestroy(this.destroy.bind(this)));
        // this.disposables.add(this.panel.onDidRescale(this.render.bind(this)));
        // this.disposables.add(this.chart.onDidZoom(this.render.bind(this)));
    }

    resize(){
        this.basis.x.tickSize(this.panel.height).ticks(Math.floor(this.panel.width / TICK_SPACING)).tickSizeOuter(0);
        this.basis.y.tickSize(-this.panel.width).ticks(Math.floor(this.panel.height / TICK_SPACING)).tickSizeOuter(0);
    }

    render(){
        this.grid.x.call(this.basis.x);
        this.grid.y.call(this.basis.y);

        this.grid.y.selectAll('.tick')
            .attr('transform', d => `translate(0, ${Math.round(this.panel.scale(d)) + 0.5})`)
            .filter(d => this.panel.scale(d) < 5).remove();

        this.grid.x.selectAll('.tick')
            .attr('transform', d => `translate(${Math.round(this.chart.scale(d), 0) + 0.5})`);
    }

    destroy(){
        this.disposables.dispose();
    }
}
