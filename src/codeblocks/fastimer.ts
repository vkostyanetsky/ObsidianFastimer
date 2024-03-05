import { 
    MarkdownPostProcessorContext,    
    MarkdownRenderer,
} from 'obsidian';

import DateTime from '../datetime'

import Fastimer from '../main';

import {
    Fast,
    FastStatus
} from '../types'

interface FastingZone {
    startTimestamp: number;
    endTimestamp: number;
    title: string;
}

export default class FastimerCodeBlock {

    public static async renderFast(plugin: Fastimer, fast: Fast, body: HTMLElement, ctx: MarkdownPostProcessorContext) 
    {
        let endTimestamp = fast.currentEndTimestamp > 0 ? fast.currentEndTimestamp : DateTime.now()
        let lines: string[] = []
        
        this.addLineWithFastTitle(lines, fast)

        if (fast.startTimestamp) {

            lines.push("> ")

            this.addStartAndEnd(lines, fast)

            lines.push("> ")

            this.addFastingZones(lines, fast, endTimestamp)

            lines.push("> ")

            this.addFastProgressBar(lines, fast, endTimestamp)

            lines.push("> ")

            this.addActualDuration(lines, fast, endTimestamp)
        }
        
        MarkdownRenderer.render(plugin.app, lines.join("\n"), body, "", plugin)
    }

    private static async addLineWithFastTitle(lines: string[], fast: Fast) {
        
        let text = new Map<FastStatus, string>([
            [FastStatus.Inactive,  `> [!abstract] INACTIVE FAST (${fast.plannedLengthInHours}h)`],
            [FastStatus.Active,    `> [!summary] ACTIVE FAST (${fast.plannedLengthInHours}h)`],
            [FastStatus.Completed, `> [!success] COMPLETED FAST (${fast.plannedLengthInHours}h)`],
            [FastStatus.Failed,    `> [!failure] FAILED FAST (${fast.plannedLengthInHours}h)`],
        ]).get(fast.status);

        if (text === undefined) text = "<?>"

        lines.push(text)
    }

    private static async addStartAndEnd(lines: string[], fast: Fast) {
             
        let from = DateTime.dateString(fast.startTimestamp)
        let goal = DateTime.dateString(fast.plannedEndTimestamp)

        lines.push(`> Starts **${from}**; ends **${goal}**.`)
    }

    private static addFastingZones(lines: string[], fast: Fast, endTimestamp: number) {

        // Calculating start timestamps:

        let anabolicZoneTimestamp = fast.startTimestamp
        let catabolicZoneTimestamp = anabolicZoneTimestamp + DateTime.HoursToMs(4)
        let fatBurningZoneTimestamp = catabolicZoneTimestamp + DateTime.HoursToMs(12)
        let ketosisZoneTimestamp = fatBurningZoneTimestamp + DateTime.HoursToMs(8)
        let deepKetosisZoneTimestamp = ketosisZoneTimestamp + DateTime.HoursToMs(48)

        // Creating zones:

        let anabolicZone: FastingZone = {
            startTimestamp: anabolicZoneTimestamp,
            endTimestamp: catabolicZoneTimestamp - 1,
            title: "1. Anabolic",
        }

        let catabolicZone: FastingZone = {
            startTimestamp: catabolicZoneTimestamp,
            endTimestamp: fatBurningZoneTimestamp - 1,
            title: "2. Catabolic"
        }

        let fatBurningZone: FastingZone = {
            startTimestamp: fatBurningZoneTimestamp,
            endTimestamp: ketosisZoneTimestamp - 1,
            title: "3. Fat burning"
        }

        let ketosisZone: FastingZone = {
            startTimestamp: ketosisZoneTimestamp,
            endTimestamp: deepKetosisZoneTimestamp - 1,
            title: "4. Ketosis"
        }

        let deepKetosisZone: FastingZone = {
            startTimestamp: deepKetosisZoneTimestamp,
            endTimestamp: 0,
            title: "5. Deep ketosis"
        }

        // Rendering:

        lines.push("> Fasting zones:")
        lines.push("> ")

        this.addFastingZone(lines, fast, anabolicZone, endTimestamp)
        this.addFastingZone(lines, fast, catabolicZone, endTimestamp)
        this.addFastingZone(lines, fast, fatBurningZone, endTimestamp)
        this.addFastingZone(lines, fast, ketosisZone, endTimestamp)
        this.addFastingZone(lines, fast, deepKetosisZone, endTimestamp)
    }

    private static addFastingZone(lines: string[], fast: Fast, zone: FastingZone, endTimestamp: number) {

        let note_text = fast.currentEndTimestamp > 0 ? " **← you were here**" : " **← you are here**"
        let note = 
            endTimestamp >= zone.startTimestamp 
            && 
            (endTimestamp < zone.endTimestamp || zone.endTimestamp == 0)
            ? note_text
            : ""
        
        let from = DateTime.dateString(zone.startTimestamp)

        lines.push(`> ${zone.title} zone starts ${from}${note}`)
    }

    private static async addFastProgressBar(lines: string[], fast: Fast, endTimestamp: number) {

        let seconds_now = (endTimestamp - fast.startTimestamp)
        let seconds_all = (fast.plannedEndTimestamp - fast.startTimestamp)
    
        let percent = seconds_now / seconds_all * 100
    
        let done_len = percent / 2.5
        done_len = done_len < 40 ? done_len : 40
            
        let left_len = 40 - done_len
    
        let left = "-".repeat(left_len)
        let done = "|".repeat(done_len)
        let tail = Math.floor(percent)
    
        lines.push(`> \`${done}${left} ${tail}%\``)
    }

    private static addActualDuration(lines: string[], fast: Fast, endTimestamp: number) {

        let timestamp1 = fast.startTimestamp
        let timestamp2 = fast.currentEndTimestamp == 0 ? endTimestamp : fast.currentEndTimestamp
         
        let difference = DateTime.timestampsDifference(timestamp1, timestamp2)
        let postfix = ""

        if (endTimestamp <= fast.plannedEndTimestamp) {
            postfix = `remaining: **${DateTime.timestampsDifference(endTimestamp, fast.plannedEndTimestamp)}**`
        }
        else {
            postfix = `extra: **${DateTime.timestampsDifference(fast.plannedEndTimestamp, endTimestamp)}**`
        }

        lines.push(`> Actual duration: **${difference}** (${postfix})`)
    }

}