
import Adw from "gi://Adw";
import Gtk from "gi://Gtk";
import { ExtensionPreferences } from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class OverlayDimmerPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup({
      title: "Dimness Settings",
    });
    const row = new Adw.ActionRow({
      title: "Dim Level",
    });

    const scale = Gtk.Scale.new_with_range(
      Gtk.Orientation.HORIZONTAL,
      0.1,
      1.0,
      0.1
    );
    scale.set_digits(2);
    scale.set_value(this.getSettings().get_double("dim-level"));
    scale.connect("value-changed", () => {
      this.getSettings().set_double("dim-level", scale.get_value());
    });

    row.add_suffix(scale);
    group.add(row);
    page.add(group);
    window.add(page);
  }
}
