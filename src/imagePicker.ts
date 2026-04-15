import { replaceImagesByRule } from "./imageReplacer";
import { SupportedImage, urlRegex, bgImgRegex, pseudos, ImageReplacementRule } from "./constants";

let picking = false;
let highlightedImage: SupportedImage | null = null;
let highlightedImageBox: HTMLDivElement | null = null;
let dimOverlay: HTMLDivElement | null = null;
let replacementPopup: HTMLDivElement | null = null;
let currentReplacementImage: HTMLImageElement | null;

function createOverlay() {
    if (dimOverlay) return;

    dimOverlay = document.createElement("div");
    Object.assign(dimOverlay.style, {
        position: "fixed",
        inset: "0",
        background: "rgba(0, 0, 0, 0.33)",
        zIndex: "2147483645",
        pointerEvents: "auto"
    });

    document.documentElement.appendChild(dimOverlay);
}

function createHighlightImageBox() {
    if (highlightedImageBox) return;

    highlightedImageBox = document.createElement("div");
    Object.assign(highlightedImageBox.style, {
        position: "fixed",
        border: "2px solid cyan",
        background: "rgba(150, 200, 255, 0.2)",
        backdropFilter: "brightness(1.5)",
        pointerEvents: "none",
        zIndex: "2147483646",
        boxSizing: "border-box",
    });

    document.documentElement.appendChild(highlightedImageBox);
}

function getBackgroundImage(el: Element): string | null {
    if (!(el instanceof HTMLElement)) return null;

    let result = null;

    pseudos.forEach(pseudo => {
        const bg = pseudo === "none"
            ? getComputedStyle(el).backgroundImage
            : getComputedStyle(el, pseudo).backgroundImage;

        const url = bg.match(bgImgRegex);

        if (url) {
            result = url[1];
        }
    });

    return result;
}

export function startPicking() {
    if (picking) return;
    picking = true;
    createOverlay();
    createHighlightImageBox();
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKeyDown, true);
}

function stopPicking() {
    picking = false;
    dimOverlay?.remove();
    dimOverlay = null;
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeyDown, true);
    document.body.style.cursor = "";
    highlightedImageBox!.style.display = "none";
}

function onMouseMove(event: MouseEvent) {
    document.body.style.cursor = "crosshair";
    const elements = document.elementsFromPoint(event.clientX, event.clientY);
    let img: SupportedImage | null = null;

    for (const el of elements) {
        // 1. <img>
        if (el instanceof HTMLImageElement && !(el.parentElement instanceof HTMLPictureElement)) {
            img = { type: "img", element: el, url: el.src };
            break;
        }

        // 2. <picture>
        if (el instanceof HTMLPictureElement) {
            const child = el.getElementsByTagName("img").item(0)!
            img = { type: "picture", element: el, childImg: child, url: child.src };
            break;
        }

        // 3. <video> with poster attribute
        if (el instanceof HTMLVideoElement && el.poster.length > 0) {
            img = { type: "video", element: el, url: el.poster };
            break;
        }

        // 4. <input> with type="image"
        if (el instanceof HTMLInputElement && el.type === "image") {
            img = { type: "input", element: el, url: el.src }
            break;
        }

        // 5. background-image on element
        const bgUrl = getBackgroundImage(el);
        if (bgUrl) {
            img = { type: "background", element: el as HTMLElement, url: bgUrl };
            break;
        }
    }

    if (img && img.url.match(urlRegex)) {
        highlightedImage = img;
        const rect = img.type == "picture" && img.childImg ?
            img.childImg.getBoundingClientRect() : img.element.getBoundingClientRect()
        highlightedImageBox!.style.display = "block";
        highlightedImageBox!.style.left = `${rect.left}px`;
        highlightedImageBox!.style.top = `${rect.top}px`;
        highlightedImageBox!.style.width = `${rect.width}px`;
        highlightedImageBox!.style.height = `${rect.height}px`;
    }
    else {
        highlightedImage = null;
        highlightedImageBox!.style.display = "none";
    }
}

function onClick(event: MouseEvent) {
    if (!highlightedImage) return;

    let src = [];

    switch (highlightedImage.type) {
        case "picture":
            Array.from(highlightedImage.element.children).forEach(child => {
                if (child instanceof HTMLSourceElement) src.push(child.srcset || child.src);
                if (child instanceof HTMLImageElement) src.push(child.src);
            })
            break;
        default:
            src.push(highlightedImage.url);
    }

    showReplacementPopup(src, highlightedImage.type);
    stopPicking();
}

function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
        stopPicking();
    }
}

function showReplacementPopup(imageSrc: string[], imageType: string) {
    document.getElementById("image-replace-popup")?.remove();
    replacementPopup = document.createElement("div");
    replacementPopup.id = "image-replace-popup";

    let h2 = document.createElement("h2");
    h2.textContent = "Enter the URL of an image file";
    replacementPopup.appendChild(h2);

    let imageDiv = document.createElement("div");
    imageDiv.style.display = "flex";
    imageDiv.style.justifyContent = "center";
    replacementPopup.appendChild(imageDiv);

    let targetImage = document.createElement("img");
    targetImage.src = imageSrc[0];
    imageDiv.appendChild(targetImage);

    let arrowSymbol = document.createElement("p");
    arrowSymbol.textContent = "→";
    imageDiv.appendChild(arrowSymbol);

    currentReplacementImage = document.createElement("img")
    currentReplacementImage.src = "";
    imageDiv.appendChild(currentReplacementImage);

    let inputDiv = document.createElement("div");
    replacementPopup.appendChild(inputDiv);

    let input = document.createElement("input");
    inputDiv.appendChild(input);

    let loadButton = document.createElement("button");
    loadButton.id = "load-button";
    loadButton.textContent = "Load";
    loadButton.addEventListener("click", () => loadImage(input.value));
    inputDiv.appendChild(loadButton);

    let buttonsDiv = document.createElement("div");
    replacementPopup.appendChild(buttonsDiv);

    let confirmButton = document.createElement("button");
    confirmButton.id = "confirm-button";
    confirmButton.textContent = "Confirm";
    confirmButton.addEventListener("click", () => confirmClick(imageSrc, input.value, imageType));
    buttonsDiv.appendChild(confirmButton);

    let exitButton = document.createElement("button");
    exitButton.id = "exit-button";
    exitButton.textContent = "Exit";
    exitButton.addEventListener("click", () => document.getElementById("image-replace-popup")?.remove());
    buttonsDiv.appendChild(exitButton);

    document.body.appendChild(replacementPopup);
}

function loadImage(src: string) {
    if (src.match(urlRegex)) {
        currentReplacementImage!.src = src;
    }
}

async function confirmClick(oldPaths: string[], newPath: string, imgType: string) {
    currentReplacementImage = null;
    replacementPopup?.remove();
    replacementPopup = null;

    let newRules: ImageReplacementRule[] = [];
    let idAddition = 0;

    //console.log(`IMAGE TYPE: ${imgType}`);

    const currentHost = window.location.hostname.replace(/^www\./, "");

    oldPaths.forEach(oldPath => {
        let url;
        try {
            url = new URL(oldPath);
        } catch (e) {
            url = new URL(`https://${currentHost}${oldPath}`);
        }
        const currentImageHost = url.host;  
        const oldFilePath = url.pathname;
        let newId = Date.now() + idAddition;
        idAddition++;

        //console.log(`HOST: ${currentHost}`);
        //console.log(`IMAGE HOST: ${currentImageHost}`);
        //console.log(`PATH: ${url.toString()}`);
        //console.log(`FILE PATH: ${oldFilePath}`);

        const newRule = {
            id: newId,
            host: currentHost,
            imageHost: currentImageHost,
            oldSrc: url.toString(),
            oldFileSrc: oldFilePath,
            newSrc: newPath
        };

        newRules.push(newRule);
    })


    await browser.runtime.sendMessage({
        type: "ADD_RULES",
        rules: newRules
    });

    replaceImagesByRule(newRules, imgType);
}
