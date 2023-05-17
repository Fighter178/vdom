/**  vDOM - A completely compatible DOM (nearly the same API as in browsers) for NodeJS.
@version 0.0.1
@author Fighter178
@copyright 20203
@license MIT
@date - 5/9/2023
Note, you can use this in the browser.
*/
/**
 * The virtual DOM. For most elements to be useful, you must actually append it to a parent which is eventually appended to a virtual DOM.
 * @example
 * const dom = new VirtualDOM();
*/
export declare class VirtualDOM {
    #private;
    directChildren: VirtualElement[];
    children: VirtualElement[];
    /**
     * Creates a new virtual element and returns it.
     * @param {string} tagName  The tag name of the element.
     * @example
     * const mydiv = dom.createElement('div');
    */
    createElement(tagName: string): VirtualElement;
    /**
     * Removes the given child.
     * @example
     * const div = dom.querySelector('div');
     * dom.removeChild(div);
    */
    removeChild(element: VirtualElement): void;
    /**
     * Appends a new child.
     * @example
     * const div = dom.createElement("div");
     * dom.appendChild(div)
    */
    appendChild(child: VirtualElement): void;
    /** Inserts a child before the reference */
    insertBefore(child: VirtualElement, reference: VirtualElement): void;
    /** Finds the first element matching the given selector (tagName)
     * @example
     * const div = dom.querySelector("div");
     */
    querySelector(selector: string): VirtualElement | undefined;
    /** Returns all elements matching the given selector (tagName)
     * @example
     * const divs = dom.querySelectorAll("div");
     */
    querySelectorAll(selector: string): VirtualElement[];
    /**
     * Gets the element by the given id
     * @example
     * const div = dom.getElementById("mydiv");
     */
    getElementById(id: string): VirtualElement;
    /** Gets elements by the given class name. */
    getElementsByClassName(className: string): VirtualElement[];
    /** Replaces the child with the new child
     * @param {VirtualElement} child Child to replace
     * @param {VirtualElement} oldChild Old child to replace with
     * Throws an error if the old child couldn't be found.
     */
    replaceChild(child: VirtualElement, oldChild: VirtualElement): void;
    /**
     * Converts this virtual DOM to a document fragment, so it can be used in a browser.
     * **ONLY WORKS IN A BROWSER**
     * @example
     * const fragment = dom.$toDocumentFragment();
     * // Then, you can add it to the real dom
     * document.body.appendChild(fragment)
     */
    $ToDocumentFragment(): DocumentFragment;
    /** For internal use only. Don't call this. */
    _notifyTreeChange(e: VirtualElement, e2: VirtualElement): void;
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
    $onTreeChange(callback: (element: VirtualElement, oldVersion: VirtualElement) => void): void;
    /** Makes a loopable array of the tree of elements. If it makes things easier, you can change those elements, but you could also find the correct child when needed. */
    $makeTree(): VirtualElement[];
    /** A treelike structure representing the DOM. */
    get $tree(): VirtualElement[];
}
/** A generic virtual element. Don't invoke this class directly, use a Virtual DOM's createElement function. Exported for type checking only. */
export declare class VirtualElement {
    #private;
    tagName: string;
    /** For internal use only. Though, I suppose you could read from this to check if the element has been removed. (used to prevent adding element if removed before it was to be appended) */
    $isRemoved: boolean;
    attributes: Record<string, string>;
    children: VirtualElement[];
    parent?: VirtualElement | null;
    readonly parentDocument: VirtualDOM;
    private eventListeners;
    constructor(tagName: string, parentDocument: VirtualDOM);
    /** Sets an attribute of the element. */
    setAttribute(name: string, value: string): void;
    /** Gets an attribute of the element. */
    getAttribute(name: string): string;
    /** Checks if the element has the attribute. */
    hasAttribute(name: string): boolean;
    /** Removes the given attribute. */
    removeAttribute(name: string): void;
    /** Appends a child to the element. */
    appendChild(child: VirtualElement): void;
    /** Replaces a child with a new child. */
    replaceChild(child: VirtualElement, oldChild: VirtualElement): void;
    /** Clones this object, and returns it. */
    cloneNode(deep?: boolean): VirtualElement;
    /** Appends a child to the element. Alias for
     *  @see `appendChild`*/
    append(child: VirtualElement): void;
    /** Prepends a element before this element.*/
    prepend(element: VirtualElement): void;
    /** Removes the element from the DOM. Note, the element must be appended. */
    remove(): void;
    /** Removes the child from this element. */
    removeChild(child: VirtualElement): void;
    /** Not exactly like a real querySelector, it can only search tag names. */
    querySelector(selector: string): VirtualElement;
    /** @see querySelector for some notes. Returns all elements with the given tag name. (or, use "*") to return all elements */
    querySelectorAll(selector: string): VirtualElement[] | never[];
    /** Returns all elements that have the given attribute. */
    $getElementsByAttribute(attributeName: string): VirtualElement[];
    /** Returns the first element that has the given attribute. */
    $getElementByAttribute(attributeName: string): VirtualElement;
    /** Gets all elements that have the given tag name.  */
    getElementsByTagName(tagName: string): VirtualElement[] | never[];
    /** Gets the element with the given id. Searches children recursively. */
    getElementById(id: string): VirtualElement;
    /**@readonly Whether or not this element is connected to a document. */
    get isConnected(): boolean;
    set isConnected(n: boolean);
    /** Gets the element with the given class name.*/
    getElementsByClassName(className: string): VirtualElement[];
    /** @readonly The elements class list. */
    get classList(): classListArray;
    set classList(n: classListArray);
    /** The element's id. */
    get id(): string;
    set id(newID: string);
    /** The element's text content. (innerText) */
    get textContent(): string;
    set textContent(newText: string);
    /** The element's first child.  */
    get firstChild(): VirtualElement;
    set firstChild(c: VirtualElement);
    /** The element's last child. */
    get lastChild(): VirtualElement;
    set lastChild(c: VirtualElement);
    /** @readonly The element's next sibling.  */
    get nextSibling(): VirtualElement;
    set nextSibling(n: VirtualElement);
    /** @readonly  The element's previous sibling.  */
    get previousSibling(): VirtualElement;
    set previousSibling(n: VirtualElement);
    /** Attaches a new virtualDOM to the element. */
    attachShadow(options?: ShadowRootInit): VirtualDOM;
    /** @readonly An element's shadowRoot */
    get shadowRoot(): VirtualDOM | null;
    set shadowRoot(n: VirtualDOM | null);
    /**
     *  Adds an event listener to the element.
     * NOTE: QOL CHANGE: This function also returns a function to remove the listener
    */
    addEventListener(eventName: string, callback: (event: VirtualEvent) => void): () => void;
    /** Removes an event listener. */
    removeEventListener(eventName: string, callback: (event: VirtualEvent) => void): void;
    dispatchEvent(event: VirtualEvent): void;
    /** (QOL) Listens for events. */
    $on(event: string, callback: (event: VirtualEvent) => void): () => void;
    /** Dispatches event to self. */
    $emit(event: VirtualEvent): void;
    /** (QOL) Removes element if condition is false. */
    $if(condition: boolean): void;
    /**
     * Converts this virtualElement to an actual HTMLElement.
     * @param {boolean} convertShadow Wether or not to convert shadow roots. I would recommend keeping this at default (true) unless you experience some issues relating to too much recursion.
     * @returns {HTMLElement} An HTML element that represents the element.
     */
    $ToElement(convertShadow?: boolean): HTMLElement;
    get dataset(): Record<string, string>;
    set dataset(v: Record<string, string>);
    get innerText(): string;
    set innerText(value: string);
    /** This always returns false, as in a virtual DOM, it will not be visible. */
    checkVisibility(): boolean;
    /** The element's class name. */
    get className(): string;
    set style(value: string);
    set className(value: string);
    /** Note, this is just the style attribute. If you need it as an object, use $styleObject */
    get style(): string;
    get $styleObject(): {
        [key: string]: string;
    };
    set $styleObject(_: {
        [key: string]: string;
    });
    /** Dispatches a non-trusted virtual click event to this element. */
    click(): void;
    /** For internal use only.  */
    _duringClone(): {
        setText: (t: string) => void;
        setAttributes(attributes: Record<string, string>): void;
    };
}
/** A (loopable) array of class names, implemented _almost_ like the native version. */
declare class classListArray {
    private classNames;
    private parentElement;
    constructor(items: string[] | undefined, parent: VirtualElement);
    /** Adds class(es) to the class list.*/
    add(classes: string): void;
    /** Removes class(es) from the class list.  */
    remove(classes: string): void;
    /** Toggles a class name.  */
    toggle(className: string): void;
    /** Checks wether the class name is in the class list. */
    includes(className: string): boolean;
    /** Returns a space-separated string of the class names. */
    toString(): string;
    /** Returns an array of the class names. */
    entries(): string[];
    /** Gets a class name. */
    item(item: string): string;
    /** Loops over each class name. */
    forEach(callback: (item: string, index: number) => void): void;
    /** @readonly The number of class names. */
    get length(): number;
    set length(n: number);
    [Symbol.toStringTag]: string;
    [Symbol.iterator](): {
        next: () => {
            done: boolean;
            value: string;
        } | {
            done: boolean;
            value?: undefined;
        };
    };
}
/** A virtual event. For internal DOM use only. Use 'CustomVirtualEvent' if you need to make your own event.  */
declare class VirtualEvent {
    #private;
    readonly detail: any;
    readonly type: string;
    bubbles: boolean;
    defaultPrevented: boolean;
    target?: VirtualElement;
    isCustom: boolean;
    constructor(name: string, options?: {
        trusted?: boolean;
        bubbles?: boolean;
        detail?: any;
    });
    preventDefault(): void;
    stopPropagation(): void;
    get isTrusted(): boolean;
    set isTrusted(_: boolean);
}
export declare class CustomVirtualEvent extends VirtualEvent {
    constructor(name: string, options?: {
        bubbles?: boolean;
        detail?: any;
    });
}
export {};
