import { 
    Plugin,
    Editor,
    MarkdownView,
} from 'obsidian';

import { 
    FastimerSettingTab,
    FastimerSettings,
    DEFAULT_SETTINGS 
} from './settings';

import {
    Fast,
} from './types'

import DateTime from './datetime'
import FastsParser from './parser';
import FastimerCodeBlock from './codeblocks/fastimer';

export default class Fastimer extends Plugin {    
    settings: FastimerSettings;

    async onload() {
        
        await this.loadSettings();

		this.addSettingTab(new FastimerSettingTab(this.app, this));

		this.addCommand({
			id: 'insert-fasting-tracker',
			name: 'Insert fasting tracker',
			editorCallback: (editor: Editor, view: MarkdownView) => {

                const startDate = DateTime.dateString(DateTime.now(), false)
                
				editor.replaceSelection(`\`\`\`fastimer\n${this.settings.regularFastLength}\n${startDate}\n\`\`\``);
			}
		});

		this.addCommand({
			id: 'insert-current-date-and-time',
			name: 'Insert current date & time',
			editorCallback: (editor: Editor, view: MarkdownView) => {

                const startDate = DateTime.dateString(DateTime.now(), false)
                
				editor.replaceSelection(startDate);
			}
		});

        this.registerMarkdownCodeBlockProcessor("fastimer", async (src, el, ctx) => {

            let fast: Fast | null = null;

            try 
            {
                fast = FastsParser.fast(src, ctx, this.settings);
            } 
            catch (error) 
            {
                el.createEl("h3", {text: `Failed to read fast: ${error.message}`});
                return;
            }

            try 
            {            
                const root = el.createEl("div");
                const body = root.createEl("div");

                await FastimerCodeBlock.renderFast(this, fast, body, ctx);
            }
            catch (error) 
            {
                el.createEl("h3", {text: `Failed to show fast: ${error.message}`});
            }

        });
    }

    onunload() {        
    }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}