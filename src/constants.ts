export type ImageReplacementRule = {
    id: number;
    host: string;
    imageHost: string;
    oldSrc: string;
    oldFileSrc: string;
    newSrc: string;
};

export type SupportedImage =
    | { type: "img"; element: HTMLImageElement; url: string }
    | { type: "picture"; element: HTMLPictureElement; childImg: HTMLImageElement | null; url: string }
    | { type: "video"; element: HTMLVideoElement; url:string }
    | { type: "input"; element: HTMLInputElement; url:string }
    | { type: "background"; element: HTMLElement; url: string };

export const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
export const bgImgRegex = /url\(["']?(.*?)["']?\)/

export const pseudos: Array<string> = ["none", "::before", "::after"];