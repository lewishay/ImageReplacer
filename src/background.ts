import { ImageReplacementRule } from "./constants";

browser.runtime.onInstalled.addListener(loadRules);
browser.runtime.onStartup.addListener(loadRules);

async function loadRules() {
    const result = await browser.storage.local.get("imageRules");
    const rules: ImageReplacementRule[] = result.imageRules ?? [];
    await updateRules(rules);
}

browser.runtime.onMessage.addListener(async (msg) => {
    if (msg.type === "addRule") {
        const result = await browser.storage.local.get("imageRules");
        const rules: ImageReplacementRule[] = result.imageRules ?? [];
        rules.push(msg.rule);
        await browser.storage.local.set({ imageRules: rules });
        await updateRules(rules);
    }
    else if (msg.type === "deleteRule") {
        const result = await browser.storage.local.get("imageRules");
        const existingRules: ImageReplacementRule[] = result.imageRules ?? [];
        const updatedRules = existingRules.filter(r => r.id !== msg.rule.id);
        await browser.storage.local.set({ imageRules: updatedRules });
        await updateRules(updatedRules);
    }
});

function createRedirectRule(rule: ImageReplacementRule): browser.declarativeNetRequest.Rule {
    return {
        id: rule.id,
        priority: 1,
        action: {
            type: "redirect",
            redirect: {
                url: rule.newSrc
            }
        },
        condition: {
            urlFilter: rule.oldFileName,
            resourceTypes: ["image", "imageset"],
            initiatorDomains: [rule.host]
        }
    };
}

async function updateRules(rules: ImageReplacementRule[]) {
    const redirectRules = rules.map(createRedirectRule);

    const existing = await browser.declarativeNetRequest.getDynamicRules();

    await browser.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existing.map(r => r.id),
        addRules: redirectRules
    });
}
