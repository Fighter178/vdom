import { VirtualDOM } from "./index.js";
const dom = new VirtualDOM();
const button = dom.createElement("button");
let count = 3;
button.innerText = `Clicked ${count} times.`;
button.$on("click", () => {
    count++;
    button.innerText = `Clicked ${count} time${count === 1 ? "" : "s"}.`;
});
button.style = "color:black;";
button.setAttribute("data-test", "test");
console.log(button.dataset);
dom.appendChild(button);
dom.$onTreeChange(async (el) => {
    if (el.$isRemoved) {
        document.querySelector(el.tagName)?.remove();
        return;
    }
    ;
    document.body.replaceChild(el.$ToElement(), document.querySelector(el.tagName));
});
document.body.append(dom.$ToDocumentFragment());
//@ts-ignore
globalThis["btn"] = button;
