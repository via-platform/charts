const {CompositeDisposable, Disposable, etch} = require('via');
const fs = require('fs');
const path = require('path');
const $ = etch.dom;

module.exports = class Screenshot {
    static describe(){
        return {
            name: 'screenshot',
            title: 'Screenshot',
            description: 'Saves a screenshot of the chart.'
        };
    }

    static instance(params){
        return new Screenshot(params);
    }

    constructor({chart}){
        this.disposables = new CompositeDisposable();
        this.chart = chart;
        etch.initialize(this);

        // this.disposables.add(this.chart.tools.add({element: this.element, location: 'right', priority: 1}));
        // this.disposables.add(via.commands.add(this.chart.element, 'charts:screenshot', this.screenshot.bind(this)));
    }

    update(){}

    render(){
        return $.div({classList: 'type toolbar-button', onClick: this.screenshot.bind(this)}, 'Screenshot');
    }

    screenshot(){
        via.applicationDelegate.capturePage(this.chart.element.getBoundingClientRect(), image => {
            const screenshots_folder = path.join(via.getConfigDirPath(), 'screenshots');

            if(!fs.existsSync(screenshots_folder)){
                fs.mkdirSync(screenshots_folder);
            }

            fs.writeFile(path.join(screenshots_folder, `Via Capture ${via.fn.time.formatString(new Date(), 'YYYY-MM-DD [at] H.mm.ss A')}.png`), image.toPNG(), error => {
                if(error){
                    via.console.error('Error saving screenshot!');
                }else{
                    via.console.alert('Saved screenshot.');
                }
            });
        });
    }

    destroy(){
        this.disposables.dispose();
    }
}
