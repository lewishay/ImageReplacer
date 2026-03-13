import { replaceImagesByRule } from "./imageReplacer";
import { SupportedImage, urlRegex, bgImgRegex, pseudos } from "./constants";

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
        pointerEvents: "none"
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
        if (el instanceof HTMLImageElement) {
            img = { type: "img", element: el };
            break;
        }

        // 2. background-image on element
        const bgUrl = getBackgroundImage(el);
        if (bgUrl) {
            img = { type: "background", element: el as HTMLElement, url: bgUrl };
            break;
        }
    }

    if (img) {
        highlightedImage = img;
        const rect = img.type === "img"
            ? img.element.getBoundingClientRect()
            : img.element.getBoundingClientRect();
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
    // Prevent page interaction
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (!highlightedImage) return;

    const src = highlightedImage.type === "img"
        ? highlightedImage.element.currentSrc || highlightedImage.element.src
        : highlightedImage.url;

    showReplacementPopup(src, highlightedImage.type);
    stopPicking();
}

function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
        stopPicking();
    }
}

function showReplacementPopup(imageSrc: string, imageType: string) {
    document.getElementById("image-replace-popup")?.remove();
    replacementPopup = document.createElement("div");
    replacementPopup.id = "image-replace-popup";

    let h2 = document.createElement("h2");
    h2.textContent = "Enter a URL or local file path to replace this image";
    replacementPopup.appendChild(h2);

    let imageDiv = document.createElement("div");
    imageDiv.style.display = "flex";
    imageDiv.style.justifyContent = "center";
    replacementPopup.appendChild(imageDiv);

    let targetImage = document.createElement("img");
    targetImage.src = imageSrc;
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

async function confirmClick(oldPath: string, newPath: string, imgType: string) {
    currentReplacementImage = null;
    replacementPopup?.remove();
    replacementPopup = null;

    const oldFileName = new URL(oldPath).pathname.split("/").filter(Boolean).pop() ?? oldPath;
    let newId = Date.now();

    //console.log(oldPath);
    //console.log(oldFileName);

    const newRule = {
        id: newId,
        oldSrc: oldFileName,
        newSrc: newPath
    };

    await browser.runtime.sendMessage({
        type: "addRule",
        rule: newRule
    });

    replaceImagesByRule(newRule, imgType);
}
