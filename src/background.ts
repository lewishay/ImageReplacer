type ImageReplacementRule = {
    id: number;
    oldSrc: string;
    newSrc: string;
};

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
            urlFilter: rule.oldSrc
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
