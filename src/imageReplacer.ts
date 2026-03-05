type ImageReplacementRule = {
    oldSrc: string;
    newSrc: string;
};

export let replacementRules: ImageReplacementRule[]

replacementRules = [
    { oldSrc: "test1", newSrc: "test2" }
];

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startImageObserver);
} else {
    startImageObserver();
}

export function replaceImagesByRule(rule: ImageReplacementRule, imageType: string) {
    if (imageType == "img") {
        document.querySelectorAll("img").forEach(img => {
            if (img.src.includes(rule.oldSrc)) {
                img.src = rule.newSrc;
                return;
            }
        });
    }
    else if (imageType == "background") {
        document.querySelectorAll<HTMLElement>("*[style*='background']").forEach(el => {
            const bg = el.style?.backgroundImage;
            if (!bg || bg === "none") return;

            if (bg.includes(rule.oldSrc)) {
                el.style.backgroundImage = `url("${rule.newSrc}")`;
            }
        });
    }
}

function replaceImage(img: HTMLImageElement) {
    for (const rule of replacementRules) {
        if (img.src.includes(rule.oldSrc)) {
            img.src = rule.newSrc;
            return;
        }
    }
}

function replaceBackgroundImage(el: HTMLElement) {
    const bg = el.style?.backgroundImage;
    if (!bg || bg === "none") return;

    for (const rule of replacementRules) {
        if (bg.includes(rule.oldSrc)) {
            el.style.backgroundImage = `url("${rule.newSrc}")`;
        }
    }
}

function processNode(node: Node) {
    if (node instanceof HTMLImageElement) {
        replaceImage(node);
    } else if (node instanceof HTMLElement) {
        // Check if this node has a bg image
        replaceBackgroundImage(node);

        // Get all relevant elements inside this node
        node.querySelectorAll("img").forEach(replaceImage);
        node.querySelectorAll<HTMLElement>("*[style*='background']").forEach(replaceBackgroundImage);
    }
}

function startImageObserver() {
    // Initial replacement
    document.querySelectorAll("img").forEach(replaceImage);
    document.querySelectorAll<HTMLElement>("*[style*='background']").forEach(replaceBackgroundImage);

    // Watching for future changes
    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach(processNode);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true   
    });
}