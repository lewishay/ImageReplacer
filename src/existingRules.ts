import { ImageReplacementRule } from "./constants";

document.addEventListener("DOMContentLoaded", async () => {
    const result = await browser.storage.local.get("imageRules");
    const rules = result.imageRules ?? [];
    await populateTableRows(rules);
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
    modifyButton.addEventListener("click", () => modifyRule(rule));
    fourthCol.appendChild(modifyButton);

    let deleteButton = document.createElement("button");
    deleteButton.classList += "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteRule(rule));
    fourthCol.appendChild(deleteButton);

    row.appendChild(fourthCol);

    table.appendChild(row);
}

function modifyRule(targetRule: ImageReplacementRule) {

}

async function deleteRule(targetRule: ImageReplacementRule) {
    await browser.runtime.sendMessage({
        type: "deleteRule",
        rule: targetRule
    });
}