type SupportedImage =
    | { type: "img"; element: HTMLImageElement }
    | { type: "background"; element: HTMLElement; url: string };

let picking = false;
let highlightedImage: SupportedImage | null = null;
let highlightedImageBox: HTMLDivElement | null = null;
let dimOverlay: HTMLDivElement | null = null;

browser.runtime.onMessage.addListener((message: { type?: string }) => {
    if (message.type === "START_ELEMENT_PICK") {
        startPicking();
    }
});

function createOverlay() {
    if (dimOverlay) return;

    dimOverlay = document.createElement("div");
    Object.assign(dimOverlay.style, {
        position: "fixed",
        inset: "0",
        background: "rgba(0, 0, 0, 0.33)",
        zIndex: "2147483646",
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
        zIndex: "2147483647",
        boxSizing: "border-box",
    });

    document.documentElement.appendChild(highlightedImageBox);
}

function getBackgroundImage(el: Element, beforePseudoElement: Boolean): string | null {
    if (!(el instanceof HTMLElement)) return null;

    const style = beforePseudoElement
        ? getComputedStyle(el, "::before")
        : getComputedStyle(el);
    const bg = style.backgroundImage;

    if (!bg || bg === "none") return null;

    const url = bg.match(/url\(["']?(.*?)["']?\)/);
    return url ? url[1] : null;
}

function startPicking() {
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
        const bgUrl = getBackgroundImage(el, false);
        if (bgUrl) {
            img = { type: "background", element: el as HTMLElement, url: bgUrl };
            break;
        }

        // 3. background-image on ::before
        const beforeBgUrl = getBackgroundImage(el, true);
        if (beforeBgUrl) {
            img = { type: "background", element: el as HTMLElement, url: beforeBgUrl };
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
        ? highlightedImage.element.src
        : highlightedImage.url;

    console.log("Source of selected image:", src);

    stopPicking();
}

function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
        stopPicking();
    }
}