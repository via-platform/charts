const {CompositeDisposable, Disposable, d3} = require('via');
const _ = require('underscore-plus');
const moment = require('moment');

const AXIS_WIDTH = 60;
const AXIS_HEIGHT = 22;
const FLAG_HEIGHT = AXIS_HEIGHT - 3;
const X_FLAG_WIDTH = 124; //TODO resize based on chart granularity

class Crosshair {
    constructor({chart}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        this.panels = new Map();
        this.last = null;
        this.flag = this.chart.axis.flag().classed('crosshair-flag', true);

        this.disposables.add(this.chart.panels.observePanels(panel => {
            this.panels.set(panel, {
                disposables: new CompositeDisposable(
                    panel.onDidMouseMove(this.mousemove.bind(this)),
                    panel.onDidResize(this.resize.bind(this))
                ),
                flag: panel.axis.flag().classed('crosshair-flag', true),
                crosshairs: {
                    x: panel.svg.append('path').attr('class', 'crosshair x').attr('d', `M 0 0 v ${panel.height}`),
                    y: panel.svg.append('path').attr('class', 'crosshair y').attr('d', `M 0 0 h ${panel.width}`)
                }
            });

            if(this.last){
                this.mousemove({event: this.last});
            }
        }));

        this.disposables.add(this.chart.panels.onDidRemovePanel(panel => {
            if(this.panels.has(panel)){
                this.panels.get(panel).disposables.dispose();
                this.panels.delete(panel);
            }
        }));

        this.disposables.add(this.chart.onDidZoom(this.zoom.bind(this)));
    }

    zoom(params = {}){
        //This event may not have a specific panel target as it is possible to trigger from an element resize.
        if(params.target){
            this.mousemove({event: params.event.sourceEvent, target: params.target});
        }
    }

    mousemove({event, target} = {}){
        if(!event) return; //This is a zoom event, not a mouse event

        //Move the flag on the bottom
        const date = this.chart.scale.invert(event.offsetX);
        const candle = new Date(Math.round(date.getTime() / this.chart.granularity) * this.chart.granularity);
        const position = Math.min(Math.max(Math.floor(this.chart.scale(candle)) - (X_FLAG_WIDTH / 2), 0), this.chart.width - AXIS_WIDTH - X_FLAG_WIDTH);
        this.flag.attr('transform', `translate(${position}, 0)`).select('text').text(moment(candle).format('YYYY-MM-DD HH:mm:ss'));

        //Figure out which panel was the target and move the y hair and flag on that panel
        const panel = this.panels.get(target);

        if(panel){
            const value = target.scale.invert(event.offsetY); //TODO properly format this number
            panel.flag.attr('transform', `translate(0, ${event.offsetY - Math.ceil(FLAG_HEIGHT / 2)})`).select('text').text(value.toFixed(this.chart.precision));
            panel.crosshairs.y.attr('transform', `translate(0, ${event.offsetY - 0.5})`);
        }

        //Move the x hairs on all panels
        for(const [pan, structure] of this.panels.entries()){
            structure.crosshairs.x.attr('transform', `translate(${Math.floor(this.chart.scale(candle)) - 0.5}, 0)`);
        }

        this.last = event;
    }

    resize({event, target}){
        //Properly transform the flags and numbers as well
        let panel = this.panels.get(target);

        if(panel){
            panel.crosshairs.x.attr('d', `M 0 0 v ${target.height}`);
            panel.crosshairs.y.attr('d', `M 0 0 h ${target.width}`);
        }
    }

    destroy(){
        this.disposables.dispose();
    }
}

module.exports = {
    name: 'crosshair',
    type: 'other',
    settings: {},
    title: 'Crosshair',
    description: 'Chart crosshair.',
    instance: params => new Crosshair(params)
};
