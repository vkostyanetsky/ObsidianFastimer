import { 
    App,
    PluginSettingTab,
    Setting,
} from 'obsidian';
import Fastimer from './main';

export interface FastimerSettings {
	regularFastLength: number;
    showFastingZones: boolean;
}

export const DEFAULT_SETTINGS: FastimerSettings = {
	regularFastLength: 16,
    showFastingZones: true,
}

export class FastimerSettingTab extends PluginSettingTab {
	plugin: Fastimer;

	constructor(app: App, plugin: Fastimer){
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Regular fast length')
			.setDesc('This value is used if the duration is not specified directly.')
			.addText(text => text
				.setPlaceholder(DEFAULT_SETTINGS.regularFastLength.toString())
				.setValue(this.plugin.settings.regularFastLength.toString())
				.onChange(async (value) => {
                    let parsedValue = parseInt(value);
                    if (isNaN(parsedValue)) {
                        parsedValue = DEFAULT_SETTINGS.regularFastLength
                    }
                    this.plugin.settings.regularFastLength = parsedValue;            
					await this.plugin.saveSettings();
				}));

        new Setting(containerEl)
            .setName('Show fasting zones')
            .setDesc('Adds start dates of fasting zones to the code block.')
            .addToggle(text => text
                .setValue(this.plugin.settings.showFastingZones)
                .onChange(async (value) => {
                    this.plugin.settings.showFastingZones = value;
                    await this.plugin.saveSettings();
                }));                
	}
}