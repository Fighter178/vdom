# vDOM - A Virtual DOM that is as close to a browser's implementation as possible.
(I know that not all of the native APIs are supported, I'm working on it).

## Create a virtual dom:
```ts
import {VirtualDOM} from "vdom"; // Or, you might use require.
const dom = new VirtualDOM();
```

## Creating elements
```ts
const element = dom.createElement("tagName");
```
Appending it to the DOM
```ts
dom.append(element) // or appendChild
```

### Child elements
You can add a child element to another element like so:
```ts
const element2 = dom.createElement("tagName");
element.append(element2) // or appendChild
```
You can also use `prepend` or `replaceChild` which do slightly different things

## Attributes
Get an attribute like so: 
```ts
element.getAttribute("name");
```
Set one like so:
```ts
element.setAttribute("name", "value");
```
Check if an element has one, like so: 
```ts
element.hasAttribute("name") // true/false if it exists or not.
```
## ClassList
vDOM supports most of classlist
Like so:
```ts
element.classList.add("class1 class2 etc");
element.classList.remove("class1 class2");
element.classList.entries().froEach(className=>{
    //do something
});
element.classList.includes("class") // true/false
// etc
```

# For Browsers
You can convert the entire DOM tree to a `documentFragment`, like so:
**THIS ONLY WORKS IN A BROWSER**
```ts
const fragment = dom.$ToDocumentFragment();
```
Now, you can add it to the real DOM
```ts
document.addEventListener("DOMContentLoaded", ()=>{
    const fragment = dom.$ToDocumentFragment();
    document.querySelector("body").appendChild(fragment);
    // Now, the content is rendered.
});
```
Now, that's useful and all, but what if you just need one element converted?
## Converting single elements to a HTML element
Use `element.$ToElement()`. This converts it to a native, generic `HTMLElement`.
However, of course, if you find it with document.querySelector, it will return the correct type.

## vDOM specific functions
You may have noticed that some functions are prefixed with a dollar sign ($), this means that they are vDOM specific, and aren't part of a real HTML element.
This is to distinguish between vDOM functions and normal ones. 

Also, some functions have an underscore (_) before them. Don't call them. They are for internal use only (and aren't part of a HTML element).

## WIP Features
These features are work in progress, so don't use them for anything important.
- `$onTreeChange` - Watch DOM tree changes
- Event system - Probably works most of the time.

## Notes
- `querySelector` and `querySelectorAll` **only** search for element(s) by **tag name** If you want to search by attribute use `$getElementsByAttribute` or `$getElementByAttribute`.
- `checkVisibility` is **always** false.
- Not all aria properties and attributes are implemented, use `getAttribute` and `setAttribute`
- Some properties (like `contentEditable` and the like) are **not** supported... yet.
- `element.style` is impossible (to my knowledge) to implement in native Javascript. 

## Why?
I looked a few standalone virtual DOM libraries like [Snabbdom](https://www.npmjs.com/package/snabbdom), but found that it is essentially an entirely new language. I wanted a virtual DOM that worked almost like the native version. 

## Name
vDOM - Virtual DOM. It beautifully explains itself.
