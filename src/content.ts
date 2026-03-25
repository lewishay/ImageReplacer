import { startPicking } from "./imagePicker";

const host = window.location.hostname.replace(/^www\./, "");

browser.runtime.sendMessage({
    type: "ENABLE_RULES_FOR_SITE",
    host
});

browser.runtime.onMessage.addListener((message: { type?: string }) => {
    if (message.type === "START_ELEMENT_PICK") {
        startPicking();
    }
});
