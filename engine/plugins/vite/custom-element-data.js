import fs from 'fs';
import path from 'path';

/**
 * Ensure the repo workspace or .vscode settings include Needle Engine custom HTML data if they exist
 * - Adds `./../node_modules/@needle-tools/engine/custom-elements.json`  
 *   to `.code-workspace settings.html.customData`
 * - Adds `./node_modules/@needle-tools/engine/custom-elements.json`  
 *   to `.vscode/settings.json html.customData`
 * @param {string} command
 * @param {import('../types').needleMeta | null} config
 * @param {import('../types').userSettings} userSettings
 */
export const needleCustomElementData = (command, config, userSettings = {}) => {
    // Allow disabling the workspace updater
    if (config?.noCustomElementData === true || userSettings?.noCustomElementData === true) return;

    return {
        name: 'needle:custom-element-data',
        configResolved() {
            try {
                const cwd = process.cwd();

                // 1) workspace file(s)
                const files = fs.readdirSync(cwd);
                const workspaceFiles = files.filter(f => f.endsWith('.code-workspace'));
                for (const f of workspaceFiles) {
                    const full = path.join(cwd, f);
                    try {
                        const raw = fs.readFileSync(full, 'utf8');
                        const data = JSON.parse(raw);

                        // Ensure settings.html.customData contains the workspace-relative path
                        data.settings = data.settings || {};
                        data.settings['html.customData'] = data.settings['html.customData'] || [];
                        const wantedCustomData = './../node_modules/@needle-tools/engine/custom-elements.json';
                        if (!data.settings['html.customData'].includes(wantedCustomData)) {
                            data.settings['html.customData'].push(wantedCustomData);

                            const newRaw = JSON.stringify(data, null, 2);
                            fs.writeFileSync(full, newRaw, 'utf8');
                        }
                    } catch (err) {
                        // ignore
                    }
                }

                // 2) .vscode/settings.json
                const vscodeDir = path.join(cwd, '.vscode');

                const settingsFile = path.join(vscodeDir, 'settings.json');
                /** @type {Record<string, any>} */
                let settings = {};
                let rawSettings = "";
                if (fs.existsSync(settingsFile)) {
                    try {
                        rawSettings = fs.readFileSync(settingsFile, 'utf8');
                        settings = JSON.parse(rawSettings) || {};

                        settings['html.customData'] = settings['html.customData'] || [];
                        const wantedCustomData = './node_modules/@needle-tools/engine/custom-elements.json';
                        if (!settings['html.customData'].includes(wantedCustomData)) {
                            settings['html.customData'].push(wantedCustomData);
                        
                            // Write back settings.json if changed
                            const newRawSettings = JSON.stringify(settings, null, 2);
                            fs.writeFileSync(settingsFile, newRawSettings, 'utf8');
                        }
                    } catch (err) {
                        // ignore
                    }
                }
            } catch (err) {
                // ignore
            }
        }
    }
}

export default needleCustomElementData;
