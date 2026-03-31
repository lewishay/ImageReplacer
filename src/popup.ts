const selectImageButton = document.getElementById("select-button") as HTMLButtonElement;
const existingRulesButton = document.getElementById("view-button") as HTMLButtonElement;

selectImageButton.addEventListener("click", async () => {
    const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true
    });

    if (!tabs[0]?.id) return;

    await browser.tabs.sendMessage(tabs[0].id, {
        type: "START_ELEMENT_PICK"
    });

    window.close();
});

existingRulesButton.addEventListener("click", async () => {
    browser.tabs.create({
        url: browser.runtime.getURL("existingRules.html")
    });

    window.close();
})