import { ImageReplacementRule, bgImgRegex, pseudos } from "./constants";

export function replaceImagesByRule(rule: ImageReplacementRule, imageType: string) {
    switch (imageType) {
        case "img":
            document.querySelectorAll("img").forEach(img => {
                if (img.src.includes(rule.oldFileSrc) || img.srcset.includes(rule.oldFileSrc)) {
                    img.src = rule.newSrc;
                    img.removeAttribute("srcset");
                    return;
                }
            });
            break;
        case "video":
            document.querySelectorAll("video").forEach(video => {
                if (video.poster.includes(rule.oldFileSrc)) {
                    video.poster = rule.newSrc;
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

                    if (url && url.includes(rule.oldFileSrc)) {

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
            break;
    }
}
