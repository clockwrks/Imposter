/**
 * @name LocalImpersonator
 * @author Seydou
 * @description Spoofs your local profile to appear as another Discord user including username, avatar, banner, and accent color
 * @version 0.0.3
 */

import { Plugin, Settings } from 'enmity/api/plugins';
import { React, Patcher, Webpack } from 'enmity/metro';
import { UserStore } from 'enmity/metro/stores';

interface SpoofSettings {
    targetId: string;
}

export default class LocalImpersonator extends Plugin {
    settings: SpoofSettings = { targetId: '' };
    patchIds: string[] = [];

    start() {
        this.settings = Settings.load(this.name) || this.settings;
        this.patchMessages();
        this.patchProfileUI();
    }

    stop() {
        this.patchIds.forEach(id => Patcher.unpatchAll(id));
    }

    getTargetUser() {
        return UserStore.getUser(this.settings.targetId);
    }

    patchMessages() {
        const patchId = 'LocalImpersonator-Messages';
        this.patchIds.push(patchId);

        Patcher.after(patchId, 'Messages', 'renderMessage', (args, res) => {
            const message = args[0].message;
            const target = this.getTargetUser();
            if (message.author.id === UserStore.getCurrentUser().id && target) {
                message.author.username = target.username;
                message.author.global_name = target.global_name || target.username;
                message.author.avatar = target.avatar;
            }
            return res;
        });
    }

    patchProfileUI() {
        const patchId = 'LocalImpersonator-ProfileUI';
        this.patchIds.push(patchId);

        const popoutModule = Webpack.getModule(m => m.default && m.default.displayName === 'UserPopout');
        const sidebarModule = Webpack.getModule(m => m.default && m.default.displayName === 'SidebarUserItem');
        const userModalModule = Webpack.getModule(m => m.default && m.default.displayName === 'UserProfileModal');

        // Popout
        Patcher.after(patchId, popoutModule, 'default', (args, res) => {
            const target = this.getTargetUser();
            if (!target) return res;
            const props = args[0];
            if (props.user.id === UserStore.getCurrentUser().id) {
                props.user.username = target.username;
                props.user.global_name = target.global_name || target.username;
                props.user.avatar = target.avatar;
                props.user.banner = target.banner;
                props.user.accent_color = target.accent_color;
            }
            return res;
        });

        // Sidebar
        Patcher.after(patchId, sidebarModule, 'default', (args, res) => {
            const target = this.getTargetUser();
            if (!target) return res;
            const props = args[0];
            if (props.user.id === UserStore.getCurrentUser().id) {
                props.user.username = target.username;
                props.user.global_name = target.global_name || target.username;
                props.user.avatar = target.avatar;
                props.user.banner = target.banner;
                props.user.accent_color = target.accent_color;
            }
            return res;
        });

        // User Modal
        Patcher.after(patchId, userModalModule, 'default', (args, res) => {
            const target = this.getTargetUser();
            if (!target) return res;
            const props = args[0];
            if (props.user.id === UserStore.getCurrentUser().id) {
                props.user.username = target.username;
                props.user.global_name = target.global_name || target.username;
                props.user.avatar = target.avatar;
                props.user.banner = target.banner;
                props.user.accent_color = target.accent_color;
            }
            return res;
        });
    }

    onSettingsSave(newSettings: SpoofSettings) {
        this.settings = newSettings;
        Settings.save(this.name, this.settings);
    }

    getSettingsPanel() {
        return React.createElement('div', {},
            React.createElement('input', {
                type: 'text',
                placeholder: 'Target Discord ID',
                value: this.settings.targetId,
                onChange: (e: any) => { this.settings.targetId = e.target.value; }
            })
        );
    }
}
