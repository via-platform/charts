//This file is a plugin that handles drawing on the chart. Basically, when a new
//drawing is initiated, this plugin creates the new layer (and cancels the old one, if applicable).
//This plugin listens for clicks as they may occur, until it reaches the specified number of clicks.

//This file is also responsible for managing the draw toolbar menu.

const {Disposable, CompositeDisposable, Emitter} = require('via');

module.exports = class CoreDraw {
    static describe(){
        return {
            name: 'core-draw'
        };
    }

    static instance(params){
        return new CoreDraw(params);
    }

    constructor({chart}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;

        this.disposables.add(via.commands.add(this.chart.element, {
            'core:delete': this.cancel.bind(this),
            'core:backspace': this.cancel.bind(this),
            'core:cancel': this.cancel.bind(this)
        }));

        console.log('INIT CORE DRAW');
    }

    draw(plugin){
        this.drawing = this.emitter.once('did-click', ({event, target}) => {
            const layer = target.addLayer(plugin, event);

            if(this.selected){
                this.unselect();
            }

            this.selected = layer;
            this.emitter.emit('did-select', layer);
        });
    }

    cancel(){
        if(this.drawing){
            this.drawing.dispose();
            this.drawing = null;
        }

        this.emitter.emit('did-cancel');
    }

    done(){
        if(this.drawing){
            this.drawing.dispose();
            this.drawing = null;
        }
    }
}