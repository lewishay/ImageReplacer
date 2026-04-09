import { ImageReplacementRule, bgImgRegex, pseudos } from "./constants";

export function replaceImagesByRule(rules: ImageReplacementRule[], imageType: string) {
    const targetRule = rules[0]; // Most image types will only have one rule
    switch (imageType) {
        case "img":
            document.querySelectorAll("img").forEach(img => {
                if (img.src.includes(targetRule.oldFileSrc) || img.srcset.includes(targetRule.oldFileSrc)) {
                    img.src = targetRule.newSrc;
                    img.removeAttribute("srcset");
                    return;
                }
            });
            break;
        case "picture":
            const pictures = document.querySelectorAll("picture");
            rules.forEach(rule => {
                pictures.forEach(picture => {
                    Array.from(picture.children).forEach(child => {
                        if (child instanceof HTMLSourceElement || child instanceof HTMLImageElement) {
                            if (child.src.includes(rule.oldFileSrc) || child.srcset.includes(rule.oldFileSrc)) {
                                child.src = rule.newSrc;
                                child.removeAttribute("srcset");
                                return;
                            }
                        }
                    });
                });
            });
            break;
        case "video":
            document.querySelectorAll("video").forEach(video => {
                if (video.poster.includes(targetRule.oldFileSrc)) {
                    video.poster = targetRule.newSrc;
                    return;
                }
            });
            break;
        case "input":
            document.querySelectorAll("input").forEach(input => {
                if (input.type === "image" && input.src.includes(targetRule.oldFileSrc)) {
                    input.src = targetRule.newSrc;
                    return;
                }
            });
            break;
        case "background":
            document.querySelectorAll<HTMLElement>("*").forEach(el => {
                pseudos.forEach(pseudo => {
                    const bg = pseudo === "none"
                        ? getComputedStyle(el).backgroundImage
                        : getComputedStyle(el, pseudo).backgroundImage;

                    const match = bg.match(bgImgRegex);
                    const url = match ? match[1] : null;

                    if (url && url.includes(targetRule.oldFileSrc)) {

                        if (pseudo === "none") {
                            el.style.backgroundImage = `url("${targetRule.newSrc}")`;
                        }
                        else {
                            const className = `replace-bg-${targetRule.id}`;
                            el.classList.add(className);

                            const styleEl = document.createElement("style");
                            styleEl.textContent = `.${className}${pseudo} { background-image: url("${targetRule.newSrc}") !important; }`;
                            document.head.appendChild(styleEl);
                        }
                    }
                });
            });
            break;
    }
}
