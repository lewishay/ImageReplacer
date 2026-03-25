import { ImageReplacementRule, urlRegex } from "./constants";

let modifyPopup: HTMLDivElement | null = null;

document.addEventListener("DOMContentLoaded", async () => {
    const result = await browser.storage.local.get("imageRules");
    const rules = result.imageRules ?? [];
    await populateTableRows(rules);
    document.addEventListener("keydown", onKeyDown, true);
});

async function populateTableRows(rules: ImageReplacementRule[]) {
    const table = document.getElementById("existing-rules");

    if (!table || rules.length == 0) return;

    await Promise.all(rules.map(rule => createRow(table, rule)));
}

async function createRow(table: HTMLElement, rule: ImageReplacementRule) {
    let row = document.createElement("tr");

    let firstCol = document.createElement("td");
    firstCol.classList += "host-column";
    firstCol.textContent = rule.host;
    row.appendChild(firstCol);

    let secondCol = document.createElement("td");
    secondCol.classList += "image-column";
    let oldImg = document.createElement("img");
    oldImg.classList += "table-image";
    const res = await fetch(rule.oldSrc, { cache: "no-store" }); // bypass DNR blocking
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    oldImg.src = objectUrl;
    secondCol.appendChild(oldImg);
    row.appendChild(secondCol);

    let thirdCol = document.createElement("td");
    thirdCol.classList += "image-column";
    let newImg = document.createElement("img");
    newImg.classList += "table-image";
    newImg.src = rule.newSrc;
    thirdCol.appendChild(newImg);
    row.appendChild(thirdCol);

    let fourthCol = document.createElement("td");
    fourthCol.classList += "actions-column";

    let modifyButton = document.createElement("button");
    modifyButton.classList += "modify-button";
    modifyButton.textContent = "Modify";
    modifyButton.addEventListener("click", (e: MouseEvent) => modifyRule(rule, e));
    fourthCol.appendChild(modifyButton);

    let deleteButton = document.createElement("button");
    deleteButton.classList += "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteRule(rule));
    fourthCol.appendChild(deleteButton);

    row.appendChild(fourthCol);

    table.appendChild(row);
}

function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
        modifyPopup?.remove();
        modifyPopup = null;
    }
}

function modifyRule(targetRule: ImageReplacementRule, e: MouseEvent) {
    document.getElementById("rule-modify-popup")?.remove();
    modifyPopup = document.createElement("div");
    modifyPopup.id = "rule-modify-popup";
    modifyPopup.style.left = `${e.clientX}px`;
    modifyPopup.style.top = `${e.clientY}px`;

    let h2 = document.createElement("h2");
    h2.textContent = "Enter the URL of an image file";
    modifyPopup.appendChild(h2);

    let inputDiv = document.createElement("div");
    modifyPopup.appendChild(inputDiv);

    let input = document.createElement("input");
    inputDiv.appendChild(input);

    let buttonsDiv = document.createElement("div");
    modifyPopup.appendChild(buttonsDiv);

    let confirmButton = document.createElement("button");
    confirmButton.id = "confirm-button";
    confirmButton.textContent = "Confirm";
    confirmButton.addEventListener("click", () => confirmModification(targetRule, input.value));
    buttonsDiv.appendChild(confirmButton);

    let exitButton = document.createElement("button");
    exitButton.id = "exit-button";
    exitButton.textContent = "Exit";
    exitButton.addEventListener("click", () => document.getElementById("rule-modify-popup")?.remove());
    buttonsDiv.appendChild(exitButton);

    document.body.appendChild(modifyPopup);
}

async function confirmModification(targetRule: ImageReplacementRule, newPath: string) {
    if (newPath.match(urlRegex)) {
        await browser.runtime.sendMessage({
            type: "DELETE_RULE",
            rule: targetRule
        });

        targetRule.newSrc = newPath;

        await browser.runtime.sendMessage({
            type: "ADD_RULE",
            rule: targetRule
        });
    }

    modifyPopup?.remove();
    modifyPopup = null;

    window.location.reload();
}

async function deleteRule(targetRule: ImageReplacementRule) {
    await browser.runtime.sendMessage({
        type: "DELETE_RULE",
        rule: targetRule
    });
    window.location.reload();
}