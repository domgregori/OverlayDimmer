import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class OverlayDimmerPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        let settings = this.getSettings();
        const page = new Adw.PreferencesPage();
        window.add(page);
        const group = new Adw.PreferencesGroup({
            title: 'Overlay Settings',
        });
        const row = new Adw.ActionRow({
            title: 'Opacity Level',
        });

        const valueLabel = new Gtk.Label({
            label: `${Math.round(settings.get_double('dim-level') * 100)}`,
            halign: Gtk.Align.CENTER,
        });

        const scale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            digits: 2,
            adjustment: new Gtk.Adjustment({
                lower: 0.1,
                upper: .9,
                step_increment: 0.05,
            }),
            hexpand: true,
            draw_value: false,
        });
        scale.set_digits(2);
        scale.set_value(settings.get_double('dim-level'));
        scale.connect('value-changed', () => {
            settings.set_double('dim-level', scale.get_value());
            const value = scale.get_value();
            valueLabel.set_label(`${Math.round(value * 100)}`);
        });

        row.add_suffix(valueLabel);
        row.add_suffix(scale);
        group.add(row);
        page.add(group);
    }
}
