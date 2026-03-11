import { ImageReplacementRule } from "./imagePicker";

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
        document.querySelectorAll<HTMLElement>("*").forEach(el => {
            const pseudos: Array<string> = ["none", "::before", "::after"];
            pseudos.forEach(pseudo => {
                const bg = pseudo === "none"
                    ? getComputedStyle(el).backgroundImage
                    : getComputedStyle(el, pseudo).backgroundImage;

                const match = bg.match(/url\(["']?(.*?)["']?\)/);
                const url = match ? match[1] : null;

                if (url && url.includes(rule.oldSrc)) {

                    if (pseudo === "none") {
                        el.style.backgroundImage = `url("${rule.newSrc}")`;
                    }
                    else {
                        const className = `replace-bg-${rule.id}`;
                        el.classList.add(className);

                        const styleEl = document.createElement("style");
                        styleEl.textContent = `.${className}${pseudo} {
                            background-image: url("${rule.newSrc}") !important;
                        }`;
                        document.head.appendChild(styleEl);
                    }
                }
            });
        });
    }
}
