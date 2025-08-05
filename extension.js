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


import St from 'gi://St';
import Gio from 'gi://Gio';
import Clutter from 'gi://Clutter';
import { Slider } from 'resource:///org/gnome/shell/ui/slider.js';

import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
export default class OverlayDimmerExtension extends Extension {
    enable() {
        this._settings = new Gio.Settings({schema_id: 'org.gnome.shell.extensions.overlaydimmer'});
        this._overlayOpacity = this._settings.get_double('dim-level');
        this._indicator = new PanelMenu.Button(this.metadata.name);
        const icon = new St.Icon({
            style_class: 'system-status-icon overlaydimmer-icon',
        });
        icon.gicon = Gio.icon_new_for_string(
            `${this.path}/icons/overlaydimmer.symbolic.png`
        );
        this._indicator.add_child(icon);
        // this._tapHandler = this._indicator.connect(
        //     'touch-event',
        //     this._buttonActivated.bind(this)
        // );
        this._clickHandler = this._indicator.connect('button-press-event', (actor, event) => {
            const button = event.get_button();
            if (button === Clutter.BUTTON_SECONDARY) {
                this.showSliderPopup();
                return Clutter.EVENT_STOP; // suppress default menu
            }
            return Clutter.EVENT_PROPAGATE;
        });
        this._settingsChangedHandler = this._settings.connect('changed::dim-level', () => {
            this._overlayOpacity = this._settings.get_double('dim-level');
            if (this._overlay) {
                this._overlay.set_style(
                    `background-color: rgba(0, 0, 0, ${this._overlayOpacity});`
                );
            }
        });
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator?.disconnect(this._tapHandler);
        this._tapHandler = null;
        this._indicator?.disconnect(this._clickHandler);
        this._clickHandler = null;
        this._overlay?.destroy();
        this._overlay = null;
        if (this._settings) {
            this._settings.disconnect(this._settingsChangedHandler);
            this._settings = null;
        }
        this._indicator?.destroy();
        this._indicator = null;
    }

    showSliderPopup() {
        if (this._popup)
            this._popup.destroy();

        const currentValue = this.settings.get_int('dim-level');

        this._popup = new St.Bin({
            style_class: 'popup-slider-container',
            reactive: true,
            x_expand: true,
            y_expand: true,
            child: new Slider(currentValue),
        });

        this._popup.child.connect('value-changed', slider => {
            const level = Math.round(slider.value * 100);
            this.settings.set_int('dimmer-level', level);
        });

        // Show popup near the button
        Main.uiGroup.add_actor(this._popup);
        this._popup.set_position(
            this._button.get_allocation_box().x1,
            this._button.get_allocation_box().y2
        );

        // Auto-dismiss when clicking outside
        this._popup.connect('button-press-event', () => {
            this._popup.destroy();
            this._popup = null;
        });
    }

    _buttonActivated(button) {
        if (this._overlay) {
            this._overlay.visible = !this._overlay.visible;
        } else {
            const primaryMonitor = Main.layoutManager.primaryMonitor;
            this._overlay = new St.Bin({
                style_class: 'dim-overlay',
                reactive: false,
                can_focus: false,
                track_hover: false,
                width: primaryMonitor.width,
                height: primaryMonitor.height,
                visible: true,
            });
            this._overlay.set_style(
                `background-color: rgba(0, 0, 0, ${this._overlayOpacity});`
            );
            Main.uiGroup.add_child(this._overlay);
        }
    }
}

