// Displays how many items are selected of various types
// Also adds the ability to rename instances

import './object-count.mod.js';
import '../../../FormItExamplePlugins/SharedPluginFiles/ui-elements/plugin-text-input.js';
import { WSM } from '../../../FormItExamplePlugins/SharedPluginFiles/FormIt.mod.js';

class ObjectCounters extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({mode: 'open'});
        const style = document.createElement('style');
        style.innerHTML = `
        div {
            margin-top: 10px;
            margin-bottom: 10px;
            background-color: #ededed;
            font-family: Arial;
            padding: 10px;
        }`;
        this.shadow.appendChild(style);

        this.instanceNameInputs = new Map();

        const onCountChanged = () => {
            // TODO this is getting called more than it should
            let totalCount = this.faces.count.length +
                             this.edges.count.length +
                             this.vertices.count.length +
                             this.instances.count.length;

            // Display a horizontal line if there are "specific counts" to show
            if (totalCount > 0) {
                this.hr.style.display = 'block';
            } else {
                this.hr.style.display = 'none';
            }

            // Remove existing instance name inputs
            for (const [key, val] of this.instanceNameInputs) {
                this.shadow.removeChild(val);
            }
            let tmpInputs = new Map();

            // Add a text input for each instance in the selection
            for (const inst of this.instances.count) {
                const id = inst.history + '-' + inst.id;
                if (tmpInputs.has(id)) {
                    continue;
                }

                const input = document.createElement('plugin-input');
                input.setAttribute('label', 'Group Name');
                input.onInput = async () => {
                    // Set the group name on user input
                    const props = await WSM.APIGetObjectPropertiesReadOnly(inst.history, inst.id);
                    WSM.APISetObjectProperties(inst.history, inst.id, input.value, props.bReportAreaByLevel);
                };
                this.shadow.appendChild(input);
                tmpInputs.set(id, input);
            }

            this.instanceNameInputs = tmpInputs; // Because GC...
        };

        // Top level container for background styling
        const container = document.createElement('div');
        container.innerHTML = `<h3>Selection Count</h3>`;

        const allCounter = document.createElement('object-count');
        container.appendChild(allCounter);

        this.hr = document.createElement('hr');
        this.hr.style.display = 'none';
        container.appendChild(this.hr);

        this.faces = document.createElement('object-count');
        this.faces.setAttribute('type', 'face');
        this.faces.setAttribute('hide', 'true');
        this.faces.onCountChangedHandler = onCountChanged;
        container.appendChild(this.faces);

        this.edges = document.createElement('object-count');
        this.edges.setAttribute('type', 'edge');
        this.edges.setAttribute('hide', 'true');
        this.edges.onCountChangedHandler = onCountChanged;
        container.appendChild(this.edges);

        this.vertices = document.createElement('object-count');
        this.vertices.setAttribute('type', 'vertex');
        this.vertices.setAttribute('hide', 'true');
        this.vertices.onCountChangedHandler = onCountChanged;
        container.appendChild(this.vertices);

        this.instances = document.createElement('object-count');
        this.instances.setAttribute('type', 'instance');
        this.instances.setAttribute('hide', 'true');
        this.instances.onCountChangedHandler = onCountChanged;
        container.appendChild(this.instances);

        this.shadow.appendChild(container);
    }
}

customElements.define('object-counters', ObjectCounters);

export { ObjectCounters };