export type ImageReplacementRule = {
    id: number;
    host: string;
    imageHost: string;
    oldSrc: string;
    oldFileName: string;
    newSrc: string;
};

export type SupportedImage =
    | { type: "img"; element: HTMLImageElement }
    | { type: "background"; element: HTMLElement; url: string };

export const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/
export const bgImgRegex = /url\(["']?(.*?)["']?\)/

export const pseudos: Array<string> = ["none", "::before", "::after"];