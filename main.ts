import { 
    App,
    Plugin,
    PluginSettingTab,
    Setting,
    MarkdownPostProcessorContext
} from 'obsidian';

interface FastimerSettings {
	regularFastLength: number;
}

const DEFAULT_SETTINGS: FastimerSettings = {
	regularFastLength: 16
}

enum FastStatus {
    Inactive = 1,
    Active,
    Failed,
    Completed,
}

interface Fast {
    startTimestamp: number;
    plannedLength: number;
    currentLength: number;  
    plannedEndTimestamp: number;    
    currentEndTimestamp: number;    
    status: FastStatus;
}

interface FastingZone {
    startTimestamp: number;
    endTimestamp: number;
    title: string;
}

export default class Fastimer extends Plugin {    
    settings: FastimerSettings;

    async onload() {
        
        await this.loadSettings();

		this.addSettingTab(new FastimerSettingTab(this.app, this));

        this.registerMarkdownCodeBlockProcessor("fastimer", async (src, el, ctx) => {

            let fast: Fast | null = null;

            try 
            {
                fast = this.fast(src, ctx);
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

                await this.renderFast(fast, body, ctx);
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

    ///////////////////////////////////////////////////////////////////
    // FAST READING
    ///////////////////////////////////////////////////////////////////

    private fast(content: string, ctx: MarkdownPostProcessorContext) {

        const fast: Fast = {
            startTimestamp: 0,
            plannedLength: 0,
            currentLength: 0,
            plannedEndTimestamp: 0,
            currentEndTimestamp: 0,            
            status: FastStatus.Inactive,
        }

        this.initFastFromContent(fast, content)
        
        this.fillFastPlannedLength(fast)
        this.fillFastCurrentLength(fast)

        this.fillFastPlannedEndTimestamp(fast)

        this.fillFastStatus(fast)

        return fast;
    }    

    private initFastFromContent(fast: Fast, content: string) {
        let lines = content.split("\n");

        lines.forEach(line => {

            line = line.trim()

            if (line.match(/^\d*$/)) {
                let value = parseInt(line)

                if (! isNaN(value) && fast.plannedLength == 0) {
                    fast.plannedLength = this.secondsInHours(value)
                }
            }
            else if (line.match(/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}$/)) {
                let value = Date.parse(line)

                if (! isNaN(value)) {
                    value = value / 1000

                    if (fast.startTimestamp == 0) {
                        fast.startTimestamp = value
                    }
                    else if (fast.currentEndTimestamp == 0) {
                        fast.currentEndTimestamp = value
                    }                    
                }
            }
        })
    }

    private fillFastPlannedLength(fast: Fast) {

        if (fast.plannedLength == 0) {
            fast.plannedLength = this.settings.regularFastLength

            if (fast.plannedLength == 0) {            
                fast.plannedLength = DEFAULT_SETTINGS.regularFastLength
            }

            fast.plannedLength = this.secondsInHours(fast.plannedLength)
        }
    }

    private fillFastCurrentLength(fast: Fast) {

        let finished = fast.currentEndTimestamp == 0 ? Date.now() / 1000 : fast.currentEndTimestamp

        fast.currentLength = finished - fast.startTimestamp
    }

    private fillFastPlannedEndTimestamp(fast: Fast) {

        fast.plannedEndTimestamp = fast.startTimestamp + fast.plannedLength
    }

    private fillFastStatus(fast: Fast) {

        let value = FastStatus.Inactive

        if (fast.startTimestamp != 0) {

            if (fast.currentEndTimestamp == 0) {
                value = FastStatus.Active        
            }
            else if (fast.currentLength >= fast.plannedLength) {
                value = FastStatus.Completed
            }
            else {
                value = FastStatus.Failed
            }            
        }

        fast.status = value
    }

    ///////////////////////////////////////////////////////////////////
    // FAST RENDERING
    ///////////////////////////////////////////////////////////////////

    private async renderFast(fast: Fast, body: HTMLElement, ctx: MarkdownPostProcessorContext) 
    {
        let endTimestamp = fast.currentEndTimestamp > 0 ? fast.currentEndTimestamp : this.now()
        let lines: string[] = []
        
        this.addLineWithFastTitle(lines, fast)

        if (fast.startTimestamp) {

            lines.push("")

            this.addFastFrom(lines, fast)
            this.addFastGoal(lines, fast)

            lines.push("")

            this.addFastingZones(lines, fast, endTimestamp)

            lines.push("")

            this.addFastProgressBar(lines, fast, endTimestamp)

            lines.push("")

            this.addFastElapsedTime(lines, fast, endTimestamp)

            if (endTimestamp <= fast.plannedEndTimestamp) {
                this.addFastRemainingTime(lines, fast, endTimestamp)
            }
            else {
                this.addFastExtraTime(lines, fast, endTimestamp)
            }
        }
        
        body.createEl("pre", {text: lines.join("\n")})
    }

    private async addLineWithFastTitle(lines: string[], fast: Fast) {

        let text = new Map<FastStatus, string>([
            [FastStatus.Inactive, "INACTIVE FAST"],
            [FastStatus.Active, "ACTIVE FAST"],
            [FastStatus.Completed, "COMPLETED FAST"],
            [FastStatus.Failed, "FAILED FAST"],
        ]).get(fast.status);

        if (text === undefined) text = "<?>"

        lines.push(text)
    }

    private async addFastFrom(lines: string[], fast: Fast) {
             
        let from = this.timestampToString(fast.startTimestamp)

        lines.push(`From: ${from}`)
    }

    private async addFastGoal(lines: string[], fast: Fast) {

        let goal = this.timestampToString(fast.plannedEndTimestamp)

        lines.push(`Goal: ${goal}`)
    }    

    private addFastingZones(lines: string[], fast: Fast, endTimestamp: number) {

        // Calculating start timestamps:

        let anabolicZoneTimestamp = fast.startTimestamp
        let catabolicZoneTimestamp = anabolicZoneTimestamp + this.secondsInHours(4)
        let fatBurningZoneTimestamp = catabolicZoneTimestamp + this.secondsInHours(12)
        let ketosisZoneTimestamp = fatBurningZoneTimestamp + this.secondsInHours(8)
        let deepKetosisZoneTimestamp = ketosisZoneTimestamp + this.secondsInHours(48)

        // Creating zones:

        let anabolicZone: FastingZone = {
            startTimestamp: anabolicZoneTimestamp,
            endTimestamp: catabolicZoneTimestamp - 1,
            title: "1. Anabolic    ",
        }

        let catabolicZone: FastingZone = {
            startTimestamp: catabolicZoneTimestamp,
            endTimestamp: fatBurningZoneTimestamp - 1,
            title: "2. Catabolic   "
        }

        let fatBurningZone: FastingZone = {
            startTimestamp: fatBurningZoneTimestamp,
            endTimestamp: ketosisZoneTimestamp - 1,
            title: "3. Fat burning "
        }

        let ketosisZone: FastingZone = {
            startTimestamp: ketosisZoneTimestamp,
            endTimestamp: deepKetosisZoneTimestamp - 1,
            title: "4. Ketosis     "
        }

        let deepKetosisZone: FastingZone = {
            startTimestamp: deepKetosisZoneTimestamp,
            endTimestamp: 0,
            title: "5. Deep ketosis"
        }

        // Rendering:

        lines.push("Fasting zones:")
        lines.push("")

        this.addFastingZone(lines, fast, anabolicZone, endTimestamp)
        this.addFastingZone(lines, fast, catabolicZone, endTimestamp)
        this.addFastingZone(lines, fast, fatBurningZone, endTimestamp)
        this.addFastingZone(lines, fast, ketosisZone, endTimestamp)
        this.addFastingZone(lines, fast, deepKetosisZone, endTimestamp)
    }

    private addFastingZone(lines: string[], fast: Fast, zone: FastingZone, endTimestamp: number) {

        let note_text = fast.currentEndTimestamp > 0 ? " ← you were here" : " ← you are here"
        let note = 
            endTimestamp >= zone.startTimestamp 
            && 
            (endTimestamp < zone.endTimestamp || zone.endTimestamp == 0)
            ? note_text
            : ""
        
        let from = this.timestampToString(zone.startTimestamp)

        lines.push(`${zone.title} ${from}${note}`)
    }

    private async addFastProgressBar(lines: string[], fast: Fast, endTimestamp: number) {

        let seconds_now = (endTimestamp - fast.startTimestamp)
        let seconds_all = (fast.plannedEndTimestamp - fast.startTimestamp)
    
        let percent = seconds_now / seconds_all * 100
    
        let done_len = percent / 2.5
        done_len = done_len < 40 ? done_len : 40
            
        let left_len = 40 - done_len
    
        let left = "-".repeat(left_len)
        let done = "#".repeat(done_len)
        let tail = Math.floor(percent)
    
        lines.push(`${done}${left} ${tail}%`)
    }

    private addFastElapsedTime(lines: string[], fast: Fast, endTimestamp: number) {

        let timestamp1 = fast.startTimestamp
        let timestamp2 = fast.currentEndTimestamp == 0 ? endTimestamp : fast.currentEndTimestamp
         
        let difference = this.timestampsDifference(timestamp1, timestamp2)

        lines.push(`Elapsed time: ${difference}`)
    }

    private addFastRemainingTime(lines: string[], fast: Fast, endTimestamp: number) {
         
        let difference = this.timestampsDifference(endTimestamp, fast.plannedEndTimestamp)

        lines.push(`Remaining:    ${difference}`)
    }    

    private addFastExtraTime(lines: string[], fast: Fast, endTimestamp: number) {
         
        let difference = this.timestampsDifference(fast.plannedEndTimestamp, endTimestamp)

        lines.push(`Extra time:   ${difference}`)
    }        

    ///////////////////////////////////////////////////////////////////
    // DATETIME UTILS
    ///////////////////////////////////////////////////////////////////

    private now() {

        return Date.now() / 1000
    }
    
    private secondsInHours(hours: number) {

        return hours * 60 * 60
    }    

    private timestampToString(ts: number) {

        return new Date(ts * 1000).toLocaleString(
            "en-CA", 
            {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                hour12: false,
                minute:'2-digit',
            }
        )
    }

    private timestampsDifference(timestamp1: number, timestamp2: number) {
        
        let seconds = timestamp2 - timestamp1
        let hours = Math.floor(seconds / 3600)
        let minutes = Math.floor(
            (seconds - (hours * 3600)) / 60
        )

        return `${hours}h ${minutes}m`
    }
    
}

class FastimerSettingTab extends PluginSettingTab {
	plugin: Fastimer;

	constructor(app: App, plugin: Fastimer){
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Regular Fast Length')
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
	}
}