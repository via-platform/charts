const {Disposable, CompositeDisposable, Emitter, d3} = require('via');
const ChartData = require('./chart-data');
const ChartStudy = require('./chart-study');
const ChartPanels = require('./chart-panels');
const ChartTools = require('./chart-tools');
const ChartAxis = require('./chart-axis');
const _ = require('underscore-plus');
const ChartDefaults = {end: 0, start: Date.now() - 864e5};
const ChartAreas = 'top left bottom right'.split(' ');
const base = 'via://charts';

const abbreviations = {
    6e4: '1m',
    18e4: '3m',
    3e5: '5m',
    6e5: '10m',
    9e5: '15m',
    18e5: '30m',
    36e5: '1h',
    72e5: '2h',
    108e5: '3h',
    144e5: '4h',
    216e5: '6h',
    288e5: '8h',
    432e5: '12h',
    864e5: '1D',
    2592e5: '3D',
    6048e5: '1W'
};

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
            // time: this.time,
            // type: this.type,
            // panels: this.panels.serialize(),
            // tools: this.tools.serialize()
        };
    }

    constructor({manager, plugins, omnibar}, state = {}){
        this.manager = manager;
        this.plugins = plugins;
        this.omnibar = omnibar;

        this.disposables = new CompositeDisposable();
        this.emitter = new Emitter();
        this.warnings = [];
        this.panels = null;
        this.uri = state.uri;
        this.initialized = false;

        this.width = 0;
        this.height = 0;
        this.type = via.config.get('charts.defaultChartType');
        this.transform = d3.zoomIdentity;

        this.padding = 0.2;
        this.bandwidth = 10;
        this.granularity = state.granularity || via.config.get('charts.defaultChartGranularity');
        this.precision = 2;
        this.selected = null;
        this.drawing = null;

        this.basis = d3.scaleTime().domain([new Date(Date.now() - this.granularity * 144), new Date()]);
        this.scale = this.basis.copy();

        this.element = document.createElement('div');
        this.element.classList.add('chart', 'pane-item', 'focusable-panel');
        this.element.tabIndex = -1;

        this.data = new ChartData(this);
        this.tools = new ChartTools({chart: this, state: state.tools});
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
            'core:delete': () => {
                this.cancel();

                if(this.selected){
                    this.selected.remove();
                }
            },
            'core:backspace': () => {
                this.cancel();

                if(this.selected){
                    this.selected.remove();
                }
            },
            'core:cancel': () => {
                this.cancel();
                this.unselect();
            },
            'charts:lock-scale': () => {
                for(const panel of this.panels.all()){
                    panel.lock();
                }
            }
        }));

        //There isn't a great place to initialize uber-general plugins like the crosshairs
        //Might as well do it here...
        this.manager.observePlugins(plugin => {
            if(plugin.type === 'other'){
                plugin.instance({chart: this, tools: this});
            }
        });

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
        if(!this.drawing){
            this.unselect();
        }

        this.emitter.emit('did-click', params);
    }

    select(layer){
        if(this.drawing) return;

        this.cancel();

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

    resize(){
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

    getIdentifier(){
        return this.getURI().slice(base.length + 1);
    }

    getTitle(){
        return this.market ? `${this.market.title}, ${this.getTypePlugin().title}, ${abbreviations[this.granularity]}` : 'Chart';
    }

    getType(){
        return this.type;
    }

    getMarket(){
        return this.market;
    }

    getTypePlugin(){
        return this.plugins.get(this.getType());
    }

    addWarning(warning){
        this.warnings.push(warning);
        this.emitter.emit('did-add-warning', warning);
    }

    removeWarning(warning){
        _.remove(this.warnings, warning);
        this.emitter.emit('did-remove-warning', warning);
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

    clearWarnings(){
        this.warnings = [];
    }

    changeMarket(market){
        if(!market || market === this.market) return;

        this.market = market;
        this.precision = this.market.precision.price;
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

    changeType(type){
        if(this.type !== type){
            const plugin = this.plugins.get(type);
            this.type = type;
            this.root().initialize(plugin);
            this.emitter.emit('did-change-type', plugin);
            this.emitter.emit('did-change-title');
        }
    }

    addTool(tool){
        const element = tool.element;
        this.emitter.emit('did-add-tool', tool);

        //TODO observe the weight of the tool to put it in the proper order
        const parent = (tool.location === 'left') ? this.refs.toolsLeft : this.refs.toolsRight;
        parent.appendChild(element);

        return new Disposable(() => this.removeTool(tool));
    }

    removeTool(tool){
        tool.element.remove();
        this.emitter.emit('did-remove-tool', tool);
    }

    addStudy(params){
        const study = new ChartStudy(this, params);
        this.studies.push(study);
        this.emitter.emit('did-add-study', study);
    }

    removeStudy(study){
        _.remove(this.studies, study);
        this.emitter.emit('did-remove-study', study);
    }

    nearestCandle(date){
        return new Date(Math.floor(date.getTime() / this.granularity) * this.granularity);
    }

    isHidden(){
        return this.element.offsetParent === null;
    }

    addLeftPanel(){

    }

    addRightPanel(){

    }

    root(){
        return this.center().getRoot();
    }

    center(){
        return this.panels.getCenter();
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

    onDidAddWarning(callback){
        return this.emitter.on('did-add-warning', callback);
    }

    onDidRemoveWarning(callback){
        return this.emitter.on('did-remove-warning', callback);
    }

    onDidChangeMarket(callback){
        return this.emitter.on('did-change-market', callback);
    }

    onDidAddStudy(callback){
        return this.emitter.on('did-add-study', callback);
    }

    onDidRemoveStudy(callback){
        return this.emitter.on('did-remove-study', callback);
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
