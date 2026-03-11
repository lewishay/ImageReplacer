import { startPicking } from "./imagePicker";

browser.runtime.onMessage.addListener((message: { type?: string }) => {
    if (message.type === "START_ELEMENT_PICK") {
        startPicking();
    }
});
