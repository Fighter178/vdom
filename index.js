/**  vDOM - A completely compatible DOM (nearly the same API as in browsers) for NodeJS.
@version 0.0.1
@author Fighter178
@copyright 20203
@license MIT
@date - 5/9/2023
Note, you can use this in the browser.
*/
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _VirtualDOM_treeChangeListeners, _VirtualElement_instances, _VirtualElement_shadow, _VirtualElement_shadowOptions, _VirtualElement_innerText, _VirtualElement_assignmentError, _a, _VirtualEvent_trusted;
// Quick Naming Convention Notes
// Any function starting with a dollar sign ($) is a vDOM-specific function (not found in browser APIs).
// Any function starting wth an underscore (_) is a private, vDOM-specific function, which shouldn't be called, ever.
/**
 * The virtual DOM. For most elements to be useful, you must actually append it to a parent which is eventually appended to a virtual DOM.
 * @example
 * const dom = new VirtualDOM();
*/
export class VirtualDOM {
    constructor() {
        this.directChildren = [];
        // Children of the DOM, but not directly of the DOM (eg. a child of a direct child for example.)
        this.children = [];
        _VirtualDOM_treeChangeListeners.set(this, []);
    }
    /**
     * Creates a new virtual element and returns it.
     * @param {string} tagName  The tag name of the element.
     * @example
     * const mydiv = dom.createElement('div');
    */
    createElement(tagName) {
        return new VirtualElement(tagName, this);
    }
    /**
     * Removes the given child.
     * @example
     * const div = dom.querySelector('div');
     * dom.removeChild(div);
    */
    removeChild(element) {
        const index = this.directChildren.indexOf(element);
        if (index !== -1) {
            this.directChildren.splice(index, 1);
        }
        else {
            const index2 = this.children.indexOf(element);
            if (index2 === -1)
                throw new Error('Element not found.');
            this.children.splice(index2, 1);
        }
        element.$isRemoved = true;
    }
    /**
     * Appends a new child.
     * @example
     * const div = dom.createElement("div");
     * dom.appendChild(div)
    */
    appendChild(child) {
        if (child.$isRemoved)
            return;
        this.directChildren.push(child);
        child.parent = null; // Set the parent of the child element to null since it is being appended to the document fragment
    }
    /** Inserts a child before the reference */
    insertBefore(child, reference) {
        if (child.$isRemoved)
            return;
        const index = this.directChildren.indexOf(reference);
        this.directChildren.splice(index, 0, child);
    }
    /** Finds the first element matching the given selector (tagName)
     * @example
     * const div = dom.querySelector("div");
     */
    querySelector(selector) {
        const check = this.directChildren.filter(e => e.tagName === selector);
        if (check.length > 0)
            return check[0];
        return this.children.filter(e => e.tagName === selector)[0];
    }
    /** Returns all elements matching the given selector (tagName)
     * @example
     * const divs = dom.querySelectorAll("div");
     */
    querySelectorAll(selector) {
        const check = this.directChildren.filter(e => e.tagName === selector);
        if (check.length > 0)
            return check;
        return this.children.filter(e => e.tagName === selector);
    }
    /**
     * Gets the element by the given id
     * @example
     * const div = dom.getElementById("mydiv");
     */
    getElementById(id) {
        const check = this.directChildren.filter(e => e.attributes.id === id);
        if (check.length > 0)
            return check[0];
        return this.children.filter(e => e.attributes.id === id)[0];
    }
    /** Gets elements by the given class name. */
    getElementsByClassName(className) {
        const check = this.directChildren.filter(e => e.attributes.class === className);
        if (check.length > 0)
            return check;
        return this.children.filter(e => e.attributes.class === className);
    }
    /** Replaces the child with the new child
     * @param {VirtualElement} child Child to replace
     * @param {VirtualElement} oldChild Old child to replace with
     * Throws an error if the old child couldn't be found.
     */
    replaceChild(child, oldChild) {
        if (child.$isRemoved)
            return;
        if (this.directChildren.includes(oldChild)) {
            const index = this.directChildren.indexOf(oldChild);
            this.directChildren[index] = child;
        }
        else if (this.children.includes(oldChild)) {
            const index = this.children.indexOf(oldChild);
            this.children[index] = child;
        }
        else
            throw new Error("Cannot find child.");
    }
    /**
     * Converts this virtual DOM to a document fragment, so it can be used in a browser.
     * **ONLY WORKS IN A BROWSER**
     * @example
     * const fragment = dom.$toDocumentFragment();
     * // Then, you can add it to the real dom
     * document.body.appendChild(fragment)
     */
    $ToDocumentFragment() {
        const fragment = document.createDocumentFragment();
        this.directChildren.forEach(e => {
            const element = e.$ToElement();
            if (element.classList.length === 0)
                element.removeAttribute("class");
            fragment.appendChild(element);
            if (e.children.length > 0) {
                const recursive = (parent, children) => {
                    children.forEach(child => {
                        const childElement = child.$ToElement();
                        if (childElement.classList.length === 0)
                            childElement.removeAttribute("class");
                        parent.appendChild(childElement);
                        if (child.children.length > 0) {
                            recursive(childElement, child.children);
                        }
                    });
                };
                recursive(element, e.children);
            }
        });
        return fragment;
    }
    /** For internal use only. Don't call this. */
    _notifyTreeChange(e, e2) {
        __classPrivateFieldGet(this, _VirtualDOM_treeChangeListeners, "f").forEach((c) => c(e, e2));
    }
    /**
     *  Register a callback to call when the tree changes.
     * @example
     * dom.$onTreeChange((newVersion, oldVersion)=>{
     *      newVersion === oldVersion // always false
     *      // Maybe you could do fancy rendering here.
     * });
     * // Like this:
    * dom.$onTreeChange(async(el)=>{
    *      if(el.$isRemoved) {
    *          document.querySelector(el.tagName)?.remove();
    *          return;
    *      };
    *      document.body.replaceChild(el.$ToElement(), document.querySelector(el.tagName) as HTMLElement);
    *  });
     */
    $onTreeChange(callback) {
        __classPrivateFieldGet(this, _VirtualDOM_treeChangeListeners, "f").push(callback);
    }
    /** Makes a loopable array of the tree of elements. If it makes things easier, you can change those elements, but you could also find the correct child when needed. */
    $makeTree() {
        const main = [];
        for (let i = 0; i < this.directChildren.length; i++) {
            const el = this.directChildren[i];
            main.push(el);
            // Recursively add all children of the element to the array, and then, add that array to the main array. Then, returns the main array.
            const r = (el) => {
                if (!(el.children.length > 0))
                    return;
                const arr = [];
                for (let i = 0; i < el.children.length; i++) {
                    const child = el.children[i];
                    arr.push(child);
                    if (child.children.length > 0)
                        r(child);
                }
                main.push(arr);
            };
            if (el.children.length > 0)
                r(el);
        }
        ;
        return main;
    }
    ;
    /** A treelike structure representing the DOM. */
    get $tree() {
        return this.$makeTree();
    }
}
_VirtualDOM_treeChangeListeners = new WeakMap();
;
/** A generic virtual element. Don't invoke this class directly, use a Virtual DOM's createElement function. Exported for type checking only. */
export class VirtualElement {
    constructor(tagName, parentDocument) {
        _VirtualElement_instances.add(this);
        _VirtualElement_shadow.set(this, null);
        _VirtualElement_shadowOptions.set(this, undefined);
        /** For internal use only. Though, I suppose you could read from this to check if the element has been removed. (used to prevent adding element if removed before it was to be appended) */
        this.$isRemoved = false;
        this.attributes = {
            class: "",
        };
        this.children = [];
        _VirtualElement_innerText.set(this, "");
        this.eventListeners = {};
        this.tagName = tagName;
        this.parentDocument = parentDocument;
    }
    /** Sets an attribute of the element. */
    setAttribute(name, value) {
        const oldVer = this.cloneNode();
        this.attributes[name] = value;
        this.parentDocument._notifyTreeChange(this, oldVer);
    }
    /** Gets an attribute of the element. */
    getAttribute(name) {
        return this.attributes[name];
    }
    /** Checks if the element has the attribute. */
    hasAttribute(name) {
        return this.attributes.hasOwnProperty(name);
    }
    /** Removes the given attribute. */
    removeAttribute(name) {
        const oldVer = this.cloneNode();
        delete this.attributes[name];
        this.parentDocument._notifyTreeChange(this, oldVer);
    }
    /** Appends a child to the element. */
    appendChild(child) {
        const oldVer = this.cloneNode();
        this.children.push(child);
        child.parent = this;
        this.parentDocument.children.push(child);
        this.parentDocument._notifyTreeChange(this, oldVer);
    }
    /** Replaces a child with a new child. */
    replaceChild(child, oldChild) {
        if (!this.children.includes(oldChild))
            throw new Error("Cannot find old child.");
        const oldVer = this.cloneNode();
        this.children[this.children.indexOf(oldChild)] = child;
        child.parent = this;
        this.parentDocument.children[this.parentDocument.children.indexOf(oldChild)] = child;
        this.parentDocument._notifyTreeChange(this, oldVer);
    }
    /** Clones this object, and returns it. */
    cloneNode(deep = true) {
        const clone = new VirtualElement(this.tagName, this.parentDocument);
        clone._duringClone().setAttributes(this.attributes);
        clone.parent = this.parent;
        clone._duringClone().setText(this.innerText);
        if (deep)
            clone.children = this.children.map(e => e.cloneNode());
        return clone;
    }
    /** Appends a child to the element. Alias for
     *  @see `appendChild`*/
    append(child) {
        this.appendChild(child);
    }
    /** Prepends a element before this element.*/
    prepend(element) {
        const oldVer = this.cloneNode();
        if (this.parentDocument.directChildren.includes(this)) {
            const index = this.parentDocument.directChildren.indexOf(this);
            this.parentDocument.directChildren.splice(index, 0, element);
            element.parent = this;
        }
        else if (this.parent) {
            const index = this.parent.children.indexOf(this);
            this.parent.children.splice(index, 0, element);
            this.parentDocument.children.splice(this.parentDocument.children.indexOf(this), 0, element);
        }
        else
            throw new Error("This element has no parent DOM or a parent element. Make sure you append this to a parent DOM or element.");
        this.parentDocument._notifyTreeChange(this, oldVer);
    }
    /** Removes the element from the DOM. Note, the element must be appended. */
    remove() {
        const oldVer = this.cloneNode();
        if (this.parentDocument.directChildren.includes(this)) {
            this.parentDocument.removeChild(this);
        }
        else if (this.parent) {
            this.parent.removeChild(this);
        }
        else {
            this.$isRemoved = true;
        }
        this.parentDocument._notifyTreeChange(this, oldVer);
    }
    /** Removes the child from this element. */
    removeChild(child) {
        const oldVer = this.cloneNode();
        this.children.splice(this.children.indexOf(child), 1);
        child.$isRemoved = true;
        this.parentDocument.children.splice(this.parentDocument.children.indexOf(child), 1);
        this.parentDocument._notifyTreeChange(this, oldVer);
    }
    /** Not exactly like a real querySelector, it can only search tag names. */
    querySelector(selector) {
        // I realize this could do with some efficiency improvements, but I really don't think its that bad.
        return this.querySelectorAll(selector)[0];
    }
    /** @see querySelector for some notes. Returns all elements with the given tag name. (or, use "*") to return all elements */
    querySelectorAll(selector) {
        if (selector === "*") {
            const arr = [];
            const r = (c) => {
                arr.push(c);
                c.children.forEach(child => { r(child); });
            };
            this.children.forEach(c => {
                r(c);
            });
            return arr;
        }
        const check = this.children.filter(e => e.tagName === selector);
        let val = check;
        if (check.length === 0) {
            const r = (el) => {
                const c = el.children.filter(e => e.tagName === selector);
                if (c.length === 0) {
                    c.forEach(child => {
                        r(child);
                    });
                }
                else {
                    val = val.concat(c);
                }
                ;
            };
        }
        ;
        return val;
    }
    ;
    /** Returns all elements that have the given attribute. */
    $getElementsByAttribute(attributeName) {
        return this.querySelectorAll("*").filter(e => e.hasAttribute(attributeName));
    }
    /** Returns the first element that has the given attribute. */
    $getElementByAttribute(attributeName) {
        return this.$getElementsByAttribute(attributeName)[0];
    }
    /** Gets all elements that have the given tag name.  */
    getElementsByTagName(tagName) {
        return this.querySelectorAll(tagName);
    }
    /** Gets the element with the given id. Searches children recursively. */
    getElementById(id) {
        let val = this.children.filter(e => e.attributes.id === id)[0];
        if (!val) {
            this.children.forEach(child => {
                val = child.getElementById(id);
                if (val)
                    return;
            });
        }
        ;
        return val;
    }
    ;
    /**@readonly Whether or not this element is connected to a document. */
    get isConnected() {
        return !this.$isRemoved;
    }
    set isConnected(n) {
        throw __classPrivateFieldGet(this, _VirtualElement_instances, "m", _VirtualElement_assignmentError).call(this, "isConnected");
    }
    /** Gets the element with the given class name.*/
    getElementsByClassName(className) {
        return this.children.filter(e => e.attributes.class === className);
    }
    ;
    /** @readonly The elements class list. */
    get classList() {
        return new classListArray(this.attributes.class?.split(" "), this);
    }
    ;
    set classList(n) {
        throw __classPrivateFieldGet(this, _VirtualElement_instances, "m", _VirtualElement_assignmentError).call(this, "classList");
    }
    ;
    /** The element's id. */
    get id() {
        return this.getAttribute("id");
    }
    set id(newID) {
        this.setAttribute("id", newID);
    }
    /** The element's text content. (innerText) */
    get textContent() {
        return this.innerText;
    }
    set textContent(newText) {
        this.innerText = newText;
    }
    /** The element's first child.  */
    get firstChild() {
        return this.children[0];
    }
    set firstChild(c) {
        const oldVer = this.cloneNode();
        this.children[0] = c;
        this.parentDocument._notifyTreeChange(this, oldVer);
    }
    /** The element's last child. */
    get lastChild() {
        return this.children[this.children.length - 1];
    }
    set lastChild(c) {
        const oldVer = this.cloneNode();
        this.children[this.children.length - 1] = c;
        this.parentDocument._notifyTreeChange(this, oldVer);
    }
    /** @readonly The element's next sibling.  */
    get nextSibling() {
        if (this.parent)
            return this.parent.children[this.parent.children.indexOf(this) + 1];
        return this.parentDocument.directChildren[this.parentDocument.children.indexOf(this) + 1];
    }
    set nextSibling(n) {
        __classPrivateFieldGet(this, _VirtualElement_instances, "m", _VirtualElement_assignmentError).call(this, "nextSibling");
    }
    /** @readonly  The element's previous sibling.  */
    get previousSibling() {
        if (this.parent)
            return this.parent.children[this.parent.children.indexOf(this) - 1];
        return this.parentDocument.directChildren[this.parentDocument.children.indexOf(this) - 1];
    }
    set previousSibling(n) {
        __classPrivateFieldGet(this, _VirtualElement_instances, "m", _VirtualElement_assignmentError).call(this, "previousSibling");
    }
    /** Attaches a new virtualDOM to the element. */
    attachShadow(options) {
        __classPrivateFieldSet(this, _VirtualElement_shadow, new VirtualDOM(), "f");
        __classPrivateFieldSet(this, _VirtualElement_shadowOptions, options ?? { mode: "open" }, "f");
        return __classPrivateFieldGet(this, _VirtualElement_shadow, "f");
    }
    /** @readonly An element's shadowRoot */
    get shadowRoot() {
        if (__classPrivateFieldGet(this, _VirtualElement_shadowOptions, "f")?.mode === "open") {
            return __classPrivateFieldGet(this, _VirtualElement_shadow, "f");
        }
        return null;
    }
    set shadowRoot(n) {
        __classPrivateFieldGet(this, _VirtualElement_instances, "m", _VirtualElement_assignmentError).call(this, "shadowRoot");
    }
    /**
     *  Adds an event listener to the element.
     * NOTE: QOL CHANGE: This function also returns a function to remove the listener
    */
    addEventListener(eventName, callback) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = new Array(0);
        }
        ;
        this.eventListeners[eventName].push(callback);
        return () => this.removeEventListener(eventName, callback);
    }
    ;
    /** Removes an event listener. */
    removeEventListener(eventName, callback) {
        this.eventListeners[eventName] = this.eventListeners[eventName].filter(e => e !== callback);
    }
    ;
    /* Sets the target of the event and triggers the associated event listeners, stopping the iteration if the event does not propagate further (bubbling is disabled). */
    dispatchEvent(event) {
        event.target = this;
        for (const callback of this.eventListeners[event.type]) {
            callback(event);
            if (!event.bubbles)
                break;
        }
        ;
    }
    ;
    /** (QOL) Listens for events. */
    $on(event, callback) {
        return this.addEventListener(event, callback);
    }
    /** Dispatches event to self. */
    $emit(event) {
        this.dispatchEvent(event);
    }
    /** (QOL) Removes element if condition is false. */
    $if(condition) {
        !condition && this.remove();
    }
    /**
     * Converts this virtualElement to an actual HTMLElement.
     * @param {boolean} convertShadow Wether or not to convert shadow roots. I would recommend keeping this at default (true) unless you experience some issues relating to too much recursion.
     * @returns {HTMLElement} An HTML element that represents the element.
     */
    $ToElement(convertShadow = true) {
        const element = document.createElement(this.tagName);
        for (const key in this.attributes) {
            if (!this.attributes[key])
                continue;
            element.setAttribute(key, this.attributes[key]);
        }
        if (__classPrivateFieldGet(this, _VirtualElement_shadow, "f") && convertShadow) {
            console.log("shadow");
            const shadow = element.attachShadow(__classPrivateFieldGet(this, _VirtualElement_shadowOptions, "f") ?? { mode: "open" });
            console.log(__classPrivateFieldGet(this, _VirtualElement_shadow, "f").directChildren);
            for (const child of __classPrivateFieldGet(this, _VirtualElement_shadow, "f").children) {
                shadow.append(child.$ToElement());
            }
            for (const child of __classPrivateFieldGet(this, _VirtualElement_shadow, "f").directChildren) {
                shadow.append(child.$ToElement(false));
            }
            ;
        }
        ;
        for (const type in this.eventListeners) {
            const l = this.eventListeners[type];
            element.addEventListener(type, (event) => {
                for (const callback of l) {
                    callback(event);
                }
                ;
            });
        }
        ;
        for (const child of this.children) {
            element.append(child.$ToElement());
        }
        ;
        element.innerText = __classPrivateFieldGet(this, _VirtualElement_innerText, "f");
        return element;
    }
    get dataset() {
        let attrs = {};
        for (const ky in this.attributes) {
            if (ky.startsWith("data-")) {
                const k = ky.slice(5);
                const v = this.attributes[k];
                // convert name to camel case
                const terms = k.split("-");
                terms.forEach((term, i) => {
                    if (i === 0)
                        return;
                    terms[i] = term[0].toUpperCase() + term.slice(1);
                });
                const name = terms.join("");
                attrs[name] = v;
                const self = this;
                Object.defineProperty(attrs, name, {
                    get() {
                        return self.getAttribute(ky);
                    },
                    set(v) {
                        self.setAttribute(ky, v);
                    },
                });
            }
        }
        return attrs;
    }
    set dataset(v) {
        const self = this;
        for (const k in v) {
            const name = `data-${fromCamelCase(k)}`;
            self.setAttribute(name, v[k]);
        }
        ;
    }
    get innerText() {
        return __classPrivateFieldGet(this, _VirtualElement_innerText, "f");
    }
    ;
    set innerText(value) {
        const oldVer = this.cloneNode();
        __classPrivateFieldSet(this, _VirtualElement_innerText, value, "f");
        this.parentDocument._notifyTreeChange(this, oldVer);
    }
    ;
    /** This always returns false, as in a virtual DOM, it will not be visible. */
    checkVisibility() {
        return false;
    }
    ;
    /** The element's class name. */
    get className() {
        return this.getAttribute("class");
    }
    set style(value) {
        this.setAttribute('style', value);
    }
    set className(value) {
        this.setAttribute("class", value);
    }
    /** Note, this is just the style attribute. If you need it as an object, use $styleObject */
    get style() {
        return this.getAttribute('style');
    }
    get $styleObject() {
        return Object.seal(parseCSSText(this.style).style);
    }
    set $styleObject(_) {
        throw __classPrivateFieldGet(this, _VirtualElement_instances, "m", _VirtualElement_assignmentError).call(this, "$styleObject");
    }
    /** Dispatches a non-trusted virtual click event to this element. */
    click() {
        this.$emit(new VirtualEvent("click", { trusted: false }));
    }
    /** For internal use only.  */
    _duringClone() {
        // These methods don't notify tree changes, to prevent recursion during the cloning process.
        const self = this;
        return {
            setText: (t) => {
                __classPrivateFieldSet(self, _VirtualElement_innerText, t, "f");
            },
            setAttributes(attributes) {
                self.attributes = attributes;
            }
        };
    }
    ;
}
_VirtualElement_shadow = new WeakMap(), _VirtualElement_shadowOptions = new WeakMap(), _VirtualElement_innerText = new WeakMap(), _VirtualElement_instances = new WeakSet(), _VirtualElement_assignmentError = function _VirtualElement_assignmentError(property) {
    throw new Error(`Cannot assign to '${property}' as it is a read-only property.`);
};
;
// Source https://github.com/30-seconds/30-seconds-of-code
const fromCamelCase = (str, separator = '-') => str
    .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
    .toLowerCase();
// Adapted from https://stackoverflow.com/a/43012849/14739273 
const parseCSSText = (cssText) => {
    const cssTxt = cssText.replace(/\/\*(.|\s)*?\*\//g, " ").replace(/\s+/g, " ");
    const style = {};
    const [, ruleName, rule] = cssTxt.match(/ ?(.*?) ?{([^}]*)}/) || [, , cssTxt];
    const cssToJs = (s) => s.replace(/\W+\w/g, (match) => match.slice(-1).toUpperCase());
    const properties = rule.split(";").map(o => o.split(":").map(x => x && x.trim()));
    for (const [property, value] of properties) {
        style[cssToJs(property)] = value;
    }
    return { cssText, ruleName, style };
};
/** A (loopable) array of class names, implemented _almost_ like the native version. */
class classListArray {
    constructor(items = [], parent) {
        this[_a] = "NodeList";
        this.classNames = items ?? [];
        this.parentElement = parent;
    }
    /** Adds class(es) to the class list.*/
    add(classes) {
        this.parentElement.setAttribute("class", this.parentElement.attributes.class + " " + classes);
        this.parentElement.setAttribute("class", this.parentElement.getAttribute("class").trimStart());
    }
    /** Removes class(es) from the class list.  */
    remove(classes) {
        this.parentElement.setAttribute("class", this.parentElement.attributes.class.replace(classes, ""));
        this.parentElement.setAttribute("class", this.parentElement.getAttribute("class").trimStart());
    }
    /** Toggles a class name.  */
    toggle(className) {
        // if the class exists, remove it, if not, add it.
        if (this.classNames.includes(className)) {
            this.remove(className);
        }
        else {
            this.add(className);
        }
    }
    /** Checks wether the class name is in the class list. */
    includes(className) {
        return this.classNames.includes(className);
    }
    /** Returns a space-separated string of the class names. */
    toString() {
        return this.classNames.join(" ");
    }
    /** Returns an array of the class names. */
    entries() {
        return this.classNames;
    }
    /** Gets a class name. */
    item(item) {
        return this.classNames[this.classNames.indexOf(item)];
    }
    /** Loops over each class name. */
    forEach(callback) {
        for (let i = 0; i < this.classNames.length; i++) {
            callback(this.classNames[i], i);
        }
        ;
    }
    /** @readonly The number of class names. */
    get length() {
        return this.classNames.length;
    }
    set length(n) {
        throw new Error("Cannot assign to `length` as it is a read-only property");
    }
    [(_a = Symbol.toStringTag, Symbol.iterator)]() {
        let i = 0;
        return {
            next: () => {
                if (i < this.classNames.length) {
                    return {
                        done: false,
                        value: this.classNames[i++]
                    };
                }
                else {
                    return {
                        done: true
                    };
                }
                ;
            }
        };
    }
    ;
}
;
/** A virtual event. For internal DOM use only. Use 'CustomVirtualEvent' if you need to make your own event.  */
class VirtualEvent {
    constructor(name, options = { trusted: false, bubbles: true }) {
        _VirtualEvent_trusted.set(this, void 0);
        this.defaultPrevented = false;
        this.isCustom = false;
        this.type = name;
        __classPrivateFieldSet(this, _VirtualEvent_trusted, options.trusted ?? false, "f");
        this.bubbles = options.bubbles ?? true;
    }
    preventDefault() {
        this.defaultPrevented = true;
    }
    stopPropagation() {
        this.bubbles = false;
    }
    get isTrusted() {
        return __classPrivateFieldGet(this, _VirtualEvent_trusted, "f");
    }
    set isTrusted(_) {
        throw new Error("event.isTrusted is a readonly property.");
    }
}
_VirtualEvent_trusted = new WeakMap();
export class CustomVirtualEvent extends VirtualEvent {
    constructor(name, options = { bubbles: true }) {
        super(name, { ...options, trusted: false });
        super.isCustom = true;
    }
    ;
}
;
