export type ImageReplacementRule = {
    id: number;
    host: string;
    imageHost: string;
    oldSrc: string;
    oldFileSrc: string;
    newSrc: string;
    isWithinIframe: boolean;
};

export type SupportedImage =
    | { type: "img"; element: HTMLImageElement; url: string, isWithinIframe: boolean }
    | { type: "picture"; element: HTMLPictureElement; childImg: HTMLImageElement | null; url: string, isWithinIframe: boolean }
    | { type: "video"; element: HTMLVideoElement; url: string, isWithinIframe: boolean }
    | { type: "input"; element: HTMLInputElement; url: string, isWithinIframe: boolean }
    | { type: "background"; element: HTMLElement; url: string, isWithinIframe: boolean };

export const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
export const bgImgRegex = /url\(["']?(.*?)["']?\)/

export const pseudos: Array<string> = ["none", "::before", "::after"];