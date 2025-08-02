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

import GObject from "gi://GObject";
import St from "gi://St";
import Gio from "gi://Gio";

import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

// import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import {
  Extension,
  gettext as _
} from "resource:///org/gnome/shell/extensions/extension.js";

export default class OverlayDimmerExtension extends Extension {
  constructor(metadata) {
    super(metadata);
  }

  enable() {
    this._indicator = new PanelMenu.Button(this.metadata.name);
    const icon = new St.Icon({
      style_class: "system-status-icon overlaydimmer-icon"
    });
    icon.gicon = Gio.icon_new_for_string(
      this.path + "/icons/overlaydimmer.symbolic.png"
    );
    this._indicator.add_child(icon);

    Main.panel.addToStatusArea(this.uuid, this._indicator);
    this._tapHandler = this._indicator.connect(
      "touch-event",
      this._buttonActivated.bind(this)
    );
    this._clickHandler = this._indicator.connect(
      "button-press-event",
      this._buttonActivated.bind(this)
    );
  }

  disable() {
    if (this._tapHandler) {
      this._indicator.disconnect(this._tapHandler);
      this._tapHandler = null;
    }
    if (this._clickHandler) {
      this._indicator.disconnect(this._clickHandler);
      this._clickHandler = null;
    }

    if (this._overlay) {
      this._overlay.destroy();
      this._overlay = null;
    }

    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
  }

  _buttonActivated() {
    if (this._overlay) {
      this._overlay.visible = !this._overlay.visible;
    } else {
      const primaryMonitor = Main.layoutManager.primaryMonitor;
      this._overlay = new St.Bin({
        style_class: "dim-overlay",
        reactive: false,
        can_focus: false,
        track_hover: false,
        width: primaryMonitor.width,
        height: primaryMonitor.height,
        visible: true
      });

      Main.uiGroup.add_child(this._overlay);
    }
  }
}
