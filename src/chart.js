const {Disposable, CompositeDisposable, Emitter, d3} = require('via');
const ChartData = require('./chart-data');
// const ChartStudy = require('./chart-study');
const granularities = require('./chart-granularities');
const ChartPanels = require('./chart-panels');
const ChartTools = require('./chart-tools');
const ChartAxis = require('./chart-axis');
const _ = require('underscore-plus');
const ChartDefaults = {end: 0, start: Date.now() - 864e5};
const base = 'via://charts';


module.exports = class Chart {
    static deserialize({manager, plugins, omnibar}, state){
        return new Chart({manager, plugins, omnibar}, state);
    }

    serialize(){
        return {
            deserializer: 'Chart',
            uri: this.getURI(),
            granularity: this.granularity,
            transform: this.transform,
            group: this.group ? this.group.color : ''
            // panels: this.panels.serialize()
        };
    }

    constructor({manager, plugins, omnibar}, state = {}){
        this.manager = manager;
        this.plugins = plugins;
        this.omnibar = omnibar;

        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.panels = null;
        this.uri = state.uri;
        this.initialized = false;

        this.width = 0;
        this.height = 0;
        this.transform = d3.zoomIdentity;

        this.padding = 0.2;
        this.bandwidth = 10;
        this.granularity = state.granularity || via.config.get('charts.defaultChartGranularity');
        this.selected = null;

        this.basis = d3.scaleTime().domain([new Date(Date.now() - this.granularity * 144), new Date()]);
        this.scale = this.basis.copy();

        this.element = document.createElement('div');
        this.element.classList.add('chart', 'pane-item', 'focusable-panel');
        this.element.tabIndex = -1;

        this.data = new ChartData(this);
        this.tools = new ChartTools({chart: this});
        this.panels = new ChartPanels({chart: this, state: state.panels});
        this.axis = new ChartAxis({chart: this});

        this.element.appendChild(this.tools.element);
        this.element.appendChild(this.panels.element);
        this.element.appendChild(this.axis.element);

        this.disposables.add(this.panels.onDidUpdateOffset(this.resize.bind(this)));

        this.resizeObserver = new ResizeObserver(this.resize.bind(this));
        this.resizeObserver.observe(this.element);

        this.setNextBandTimeout(false);

        this.disposables.add(new Disposable(() => {
            if(this.bandTimeout){
                clearTimeout(this.bandTimeout);
            }
        }));

        this.disposables.add(via.commands.add(this.element, {
            'charts:zoom-in': () => this.zoom(2),
            'charts:zoom-out': () => this.zoom(0.5),
            'core:move-left': () => this.translate(100),
            'core:move-right': () => this.translate(-100),
            'core:delete': this.delete.bind(this),
            'core:backspace': this.delete.bind(this),
            'core:cancel': this.unselect.bind(this),
            'charts:lock-scale': this.lock.bind(this)
        }));

        this.initialize(state);
    }

    async initialize(state){
        await via.markets.initialize();

        this.changeGroup(state.group ? via.workspace.groups.get(state.group) : null);

        const [method, id] = this.uri.slice(base.length + 1).split('/');

        if(method === 'market'){
            const market = via.markets.uri(id);
            this.changeMarket(market);
        }else if(method === 'public'){
            //TODO fetch state from server
        }

        if(state.transform){
            //TODO, the chart doesn't draw immediately when the transform is applied. No clue why.
            // console.log(this.transform);
            // this.transform = this.transform.scale(state.transform.k).translate(state.transform.x, state.transform.y);
            // this.zoomed();
            // console.log(this.transform);
        }

        this.initialized = true;
        this.emitter.emit('did-initialize');
    }

    translate(distance){
        if(!distance) return;

        this.transform.x += distance;
        this.zoomed();
    }

    zoom(factor = 2){
        if(!factor) return;

        const x = this.width / 2;
        const ix = this.transform.invertX(x);

        this.transform.k *= factor;
        this.transform.x = x - ix * this.transform.k;
        this.zoomed();
    }

    zoomed({event, target} = {}){
        if(event){
            this.transform = event.transform;
        }

        this.scale.domain(this.transform.rescaleX(this.basis).domain());
        this.updateBandwidth();
        this.emitter.emit('did-zoom', {event, target});
    }

    mouseover(params){
        this.emitter.emit('did-mouse-over', params);
    }

    mouseout(params){
        this.emitter.emit('did-mouse-out', params);
    }

    mousemove(params){
        this.emitter.emit('did-mouse-move', params);
    }

    click(params){
        this.unselect();
        this.emitter.emit('did-click', params);
    }

    select(layer){
        if(this.selected){
            this.unselect();
        }

        this.selected = layer;
        this.emitter.emit('did-select', layer);
    }

    unselect(){
        if(this.selected){
            this.selected = null;
            this.emitter.emit('did-unselect');
        }
    }

    resize(){
        //NOTE This is almost certainly what is causing the bug where the chart does not draw immediately - only after you move the chart
        if(this.isHidden()){
            return;
        }

        if(this.transform && this.element.clientWidth && this.width){
            //We have to subtract out the axis width (since it is fixed at `this.panels.offset`)
            //If we don't, the ratio of the old-width to new-width is incorrect
            this.transform.x = this.transform.x * ((this.element.clientWidth - this.panels.offset) / (this.width - this.panels.offset));
        }

        this.width = this.element.clientWidth;
        this.height = this.element.clientHeight;

        this.basis.range([0, this.width - this.panels.offset]);
        this.scale.range([0, this.width - this.panels.offset]);

        this.updateBandwidth();

        this.emitter.emit('did-resize', {width: this.width, height: this.height});
    }

    updateBandwidth(){
        const [start, end] = this.scale.domain();
        const total = Math.ceil((end - start) / this.granularity);
        this.bandwidth = (this.width - this.panels.offset) / total;
        this.emitter.emit('did-update-bandwidth', this.bandwidth);
    }

    consumeActionBar(actionBar){
        this.omnibar = actionBar.omnibar;
    }

    delete(){
        if(this.selected){
            this.selected.remove();
        }
    }

    lock(){
        for(const panel of this.panels.all()){
            panel.lock();
        }
    }

    destroy(){
        if(this.groupDisposables){
            this.groupDisposables.dispose();
        }

        this.data.destroy();
        this.panels.destroy();
        this.tools.destroy();
        this.axis.destroy();
        this.resizeObserver.disconnect();
        this.emitter.emit('did-destroy');

        this.disposables.dispose();
        this.emitter.dispose();
    }

    getURI(){
        return this.market ? `${base}/market/${this.market.uri()}` : base;
    }

    getTitle(){
        return this.market ? `${this.market.title}, ${granularities[this.granularity].abbreviation}` : 'Chart';
    }

    getMarket(){
        return this.market;
    }

    setNextBandTimeout(shift = true){
        if(this.bandTimeout){
            clearTimeout(this.bandTimeout);
        }

        if(shift){
            //Shift the graph to the left by one bandwidth
            this.transform.x -= this.bandwidth;
            this.zoomed();
        }

        const nextCandle = this.nearestCandle(new Date(Date.now() + this.granularity));
        this.bandTimeout = setTimeout(() => this.setNextBandTimeout(), nextCandle.getTime() - Date.now());
    }

    changeMarket(market){
        if(!market || market === this.market){
            return;
        }

        this.market = market;
        this.emitter.emit('did-change-market', market);
        this.emitter.emit('did-change-title');

        if(this.group){
            this.group.market = market;
        }
    }

    changeGroup(group){
        if(this.group === group){
            return;
        }

        this.group = group;

        if(this.groupDisposables){
            this.groupDisposables.dispose();
            this.groupDisposables = null;
        }

        if(this.group){
            this.groupDisposables = new CompositeDisposable(
                this.group.onDidChangeMarket(this.changeMarket.bind(this))
            );

            if(this.group.market){
                this.changeMarket(this.group.market);
            }else{
                this.group.market = this.market;
            }
        }

        this.emitter.emit('did-change-group', this.group);
    }

    changeGranularity(granularity){
        if(this.granularity === granularity) return;

        this.emitter.emit('will-change-granularity', granularity);
        this.granularity = granularity;

        if(via.config.get('charts.resetZoomOnGranularityChange')){
            this.basis.domain([new Date(Date.now() - (this.granularity || 3e5) * 144), new Date()]);
            this.transform = d3.zoomIdentity;
            this.zoomed();
        }else{
            this.updateBandwidth();
        }

        this.updateBandwidth();
        this.setNextBandTimeout(false);

        this.emitter.emit('did-change-granularity', granularity);
        this.emitter.emit('did-change-title');
    }

    nearestCandle(date){
        return new Date(Math.floor(date.getTime() / this.granularity) * this.granularity);
    }

    isHidden(){
        return this.element.offsetParent === null;
    }

    root(){
        return this.center().getRoot();
    }

    center(){
        return this.panels.getCenter();
    }

    onDidCancel(callback){
        return this.emitter.on('did-cancel', callback);
    }

    onDidChangeGroup(callback){
        return this.emitter.on('did-change-group', callback);
    }

    onWillChangeGranularity(callback){
        return this.emitter.on('will-change-granularity', callback);
    }

    onDidChangeGranularity(callback){
        return this.emitter.on('did-change-granularity', callback);
    }

    onDidChangeData(callback){
        return this.emitter.on('did-change-data', callback);
    }

    onDidChangeType(callback){
        return this.emitter.on('did-change-type', callback);
    }

    onDidChangeTitle(callback){
        return this.emitter.on('did-change-title', callback);
    }

    onDidChangeMarket(callback){
        return this.emitter.on('did-change-market', callback);
    }

    onDidDestroy(callback){
        return this.emitter.on('did-destroy', callback);
    }

    onDidResize(callback){
        return this.emitter.on('did-resize', callback);
    }

    onDidDraw(callback){
        return this.emitter.on('did-draw', callback);
    }

    onDidZoom(callback){
        return this.emitter.on('did-zoom', callback);
    }

    onDidMouseOver(callback){
        return this.emitter.on('did-mouse-over', callback);
    }

    onDidMouseMove(callback){
        return this.emitter.on('did-mouse-move', callback);
    }

    onDidMouseOut(callback){
        return this.emitter.on('did-mouse-out', callback);
    }

    onDidClick(callback){
        return this.emitter.on('did-click', callback);
    }

    onDidSelect(callback){
        return this.emitter.on('did-select', callback);
    }

    onDidUnselect(callback){
        return this.emitter.on('did-unselect', callback);
    }

    onDidCancel(callback){
        return this.emitter.on('did-cancel', callback);
    }
}
