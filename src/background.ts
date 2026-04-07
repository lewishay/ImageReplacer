import { ImageReplacementRule } from "./constants";

browser.runtime.onMessage.addListener(async (msg) => {
    if (msg.type === "ADD_RULES") {
        const rulesFromStorage = await browser.storage.local.get("imageRules");
        const hostsFromStorage = await browser.storage.local.get("imageReplacementHosts")
        const rules: ImageReplacementRule[] = rulesFromStorage.imageRules ?? [];
        const hosts: string[] = hostsFromStorage.imageReplacementHosts ?? [];

        const newRules: ImageReplacementRule[] = msg.rules;
        newRules.forEach(rule => {
            rules.push(rule);
            if (!hosts.includes(rule.host)) hosts.push(rule.host);
        })

        await browser.storage.local.set({ imageRules: rules });
        await browser.storage.local.set({ imageReplacementHosts: hosts });
        await updateRules(rules);
    }

    if (msg.type === "DELETE_RULE") {
        const rulesFromStorage = await browser.storage.local.get("imageRules");
        const hostsFromStorage = await browser.storage.local.get("imageReplacementHosts")
        const rules: ImageReplacementRule[] = rulesFromStorage.imageRules ?? [];
        const hosts: string[] = hostsFromStorage.imageReplacementHosts ?? [];

        let updatedHosts = hosts
        if (rules.filter((r => r.host === msg.rule.host)).length == 1) updatedHosts = hosts.filter(r => r !== msg.rule.host);
        const updatedRules = rules.filter(r => r.id !== msg.rule.id);

        await browser.storage.local.set({ imageRules: updatedRules });
        await browser.storage.local.set({ imageReplacementHosts: updatedHosts });
        await updateRules(updatedRules);
    }

    if (msg.type === "ENABLE_RULES_FOR_SITE") {
        const rulesFromStorage = await browser.storage.local.get("imageRules");
        const rules: ImageReplacementRule[] = rulesFromStorage.imageRules ?? [];

        const rulesToApply = rules.filter(r => r.host === msg.host);

        await updateRules(rulesToApply);
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
            urlFilter: rule.oldFileSrc,
            resourceTypes: ["image", "imageset"],
            requestDomains: [rule.imageHost]
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
