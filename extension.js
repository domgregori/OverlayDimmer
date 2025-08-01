/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GObject from 'gi://GObject';
import St from 'gi://St';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Toggle Dim Overlay'));

        this.add_child(new St.Icon({
            icon_name: 'lightbulb-symbolic',
            style_class: 'system-status-icon',
        }));
    }
});

export default class OverlayDimmerExtension extends Extension {
    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);

        const primaryMonitor = Main.layoutManager.primaryMonitor;

        this._overlay = new St.Bin({
            style_class: 'dim-overlay',
            reactive: false,
            can_focus: false,
            track_hover: false,
            width: primaryMonitor.width,
            height: primaryMonitor.height,
            visible: false,
        });
        Main.uiGroup.add_child(this._overlay);

        this._indicator.connect('button-press-event', () => {
            this._overlay.visible = !this._overlay.visible;
        });
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;

        if (this._overlay) {
            this._overlay.destroy();
            this._overlay = null;
        }
    }
}
