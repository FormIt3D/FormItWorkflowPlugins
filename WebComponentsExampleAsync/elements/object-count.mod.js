// Displays how many of a particular type of object is selected
// Usage: <object-count type="edge|face|object|vertex|instance" hide="true|false"></object-count>
//
// Change events: on-count-changed or onCountChangedHandler (class property).
// Triggered when the there is in object selection

import {FormItInterface} from '../../../FormItExamplePlugins/SharedPluginFiles/FormItInterface.mod.js';
import {FormIt, WSM} from '../../../FormItExamplePlugins/SharedPluginFiles/FormIt.mod.js';

// Supported selection types
const TYPE_STRING_MAP = {
    all: null,
    edge: {
        id: WSM.nObjectType.nEdgeType,
        label: "Edges: "
    },
    face: {
        id: WSM.nObjectType.nFaceType,
        label: "Faces: "
    },
    object: {
        id: WSM.nObjectType.nObjectType,
        label: "Objects: "
    },
    vertex: {
        id: WSM.nObjectType.nVertexType,
        label: "Vertices: "
    },
    instance: {
        id: WSM.nObjectType.nInstanceType,
        label: "Instances: "
    }
};

class ObjectCount extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({mode: 'open'});

        this.onCountChangedHandler = null;

        this.label = document.createElement('label');
        this.shadow.appendChild(this.label);

        // Number of currently selected items
        this.count = [];

        // Type of object we're counting. If null, count everything
        this.type = this.getAttribute('type');

        // If true, this element will remain hidden unless this.count > 0
        this.hide = !!this.getAttribute('hide');

        this.objectCount = document.createElement('label');
        this.objectCount.innerHTML = '0';
        this.objectCount.style.lineHeight = '25px';
        this.shadow.appendChild(this.objectCount);

        FormItInterface.SubscribeMessage("FormIt.Message.kSelectionsChanged", async () => {
            const currentSelection = await FormIt.Selection.GetSelections();

            let count = [];

            const hist = await FormIt.GroupEdit.GetEditingHistoryID();
            if (this._type) {
                // Count how many objects of are selected for the current type we're tracking
                if (currentSelection.length > 0) {
                    for (const sID of currentSelection) {
                        const histDepth = sID.ids.length - 1;
                        const oid = sID.ids[histDepth].Object;
                        if ((await WSM.APIGetObjectTypeReadOnly(hist, oid)) === this._type.id) {
                            // ++count;
                            count.push({ history: hist, id: oid});
                        }
                    }
                }
            } else {
                // count = currentSelection.length;
                count = currentSelection.map(x => { return { history: hist, id: x.ids[x.ids.length - 1].Object };});
            }

            this.objectCount.innerHTML = count.length + "";
            if (this._hide) {
                if (count.length > 0) {
                    this.style.display = 'block';
                } else {
                    this.style.display = 'none';
                }
            }

            this.count = count;

            if (this.onCountChangedHandler) {
                // TODO This seems to be happening many times for a single change.
                this.onCountChangedHandler(this);
            }
        });
    }

    static get observedAttributes() {
        return [
            'type',
            'hide',
            'on-count-changed'
        ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'type') {
            this.type = newValue;
        } else if (name === 'hide') {
            this.hide = !!newValue;
        } else if (name === 'on-count-changed') {
            this.onCountChangedHandler = newValue;
        }
    }

    set type(val) {
        this._type = TYPE_STRING_MAP[val];
        if (this._type) {
            this.label.innerHTML = this._type.label;
        } else {
            // Count "all" objects
            this.label.innerHTML = 'Total objects: ';
        }
    }

    get type() {
        return this._type;
    }

    set hide(val) {
        this._hide = val;
        if (this._hide) {
            this.style.display = 'none';
        }
    }

    get hide() {
        return this._hide;
    }
}

customElements.define('object-count', ObjectCount);

export { ObjectCount };