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
        const endTimestamp = fast.currentEndTimestamp > 0 ? fast.currentEndTimestamp : DateTime.now()
        const lines: string[] = []
        
        this.addLineWithFastTitle(lines, fast)

        if (fast.startTimestamp) {

            lines.push("> ")
            this.addStartAndEnd(lines, fast)

            lines.push("> ")
            this.addActualDuration(lines, fast, endTimestamp)

            if (plugin.settings.showProgressBar) {

                lines.push("> ")
                this.addFastProgressBar(lines, fast, endTimestamp)
            }

            if (plugin.settings.showFastingZones) {

                lines.push("> ")
                this.addFastingZones(lines, fast, endTimestamp)                
            }
        }
        
        MarkdownRenderer.render(plugin.app, lines.join("\n"), body, "", plugin)
    }

    private static async addLineWithFastTitle(lines: string[], fast: Fast) {
        
        let text = new Map<FastStatus, string>([
            [FastStatus.Inactive,  `> [!abstract] Inactive fast (${fast.plannedLengthInHours}h)`],
            [FastStatus.Active,    `> [!summary] Active fast (${fast.plannedLengthInHours}h)`],
            [FastStatus.Completed, `> [!success] Completed fast (${fast.plannedLengthInHours}h)`],
            [FastStatus.Failed,    `> [!failure] Failed fast (${fast.plannedLengthInHours}h)`],
        ]).get(fast.status);

        if (text === undefined) text = "<?>"

        lines.push(text)
    }

    private static async addStartAndEnd(lines: string[], fast: Fast) {
             
        const fromVerb = this.dateVerb(fast.startTimestamp, "Started", "Will start")
        const fromDate = DateTime.dateString(fast.startTimestamp)

        const goalVerb = this.dateVerb(fast.plannedEndTimestamp, "should have completed", "should be completed")
        const goalDate = DateTime.dateString(fast.plannedEndTimestamp)

        lines.push(`> ${fromVerb} **${fromDate}**; ${goalVerb} **${goalDate}**.`)
    }

    private static addFastingZones(lines: string[], fast: Fast, endTimestamp: number) {

        // Calculating start timestamps:

        const anabolicZoneTimestamp = fast.startTimestamp
        const catabolicZoneTimestamp = anabolicZoneTimestamp + DateTime.HoursToMs(4)
        const fatBurningZoneTimestamp = catabolicZoneTimestamp + DateTime.HoursToMs(12)
        const ketosisZoneTimestamp = fatBurningZoneTimestamp + DateTime.HoursToMs(8)
        const deepKetosisZoneTimestamp = ketosisZoneTimestamp + DateTime.HoursToMs(48)

        // Creating zones:

        const anabolicZone: FastingZone = {
            startTimestamp: anabolicZoneTimestamp,
            endTimestamp: catabolicZoneTimestamp - 1,
            title: "1. Anabolic",
        }

        const catabolicZone: FastingZone = {
            startTimestamp: catabolicZoneTimestamp,
            endTimestamp: fatBurningZoneTimestamp - 1,
            title: "2. Catabolic"
        }

        const fatBurningZone: FastingZone = {
            startTimestamp: fatBurningZoneTimestamp,
            endTimestamp: ketosisZoneTimestamp - 1,
            title: "3. Fat burning"
        }

        const ketosisZone: FastingZone = {
            startTimestamp: ketosisZoneTimestamp,
            endTimestamp: deepKetosisZoneTimestamp - 1,
            title: "4. Ketosis"
        }

        const deepKetosisZone: FastingZone = {
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

        const noteText = fast.currentEndTimestamp > 0 ? " **← you were here**" : " **← you are here**"
        const note = 
            endTimestamp >= zone.startTimestamp 
            && 
            (endTimestamp < zone.endTimestamp || zone.endTimestamp == 0)
            ? noteText
            : ""

        const from = DateTime.dateString(zone.startTimestamp)
        const verb = 
            endTimestamp < zone.startTimestamp && (fast.status == FastStatus.Completed || fast.status == FastStatus.Failed)
            ? "would start"
            : this.dateVerb(zone.startTimestamp, "started", "will start")

        lines.push(`> ${zone.title} zone ${verb} ${from}${note}`)
    }

    private static async addFastProgressBar(lines: string[], fast: Fast, endTimestamp: number) {

        const secondsNow = endTimestamp > fast.startTimestamp ? endTimestamp - fast.startTimestamp : 0
        const secondsAll = (fast.plannedEndTimestamp - fast.startTimestamp)
    
        const percent = secondsNow / secondsAll * 100
    
        let doneLen = percent / 2.5
        doneLen = doneLen < 40 ? doneLen : 40
            
        const leftLen = 40 - doneLen
    
        const left = "-".repeat(leftLen)
        const done = "#".repeat(doneLen)
        const tail = Math.floor(percent)
    
        lines.push(`> \`${done}${left}\` ${tail}%`)
    }

    private static addActualDuration(lines: string[], fast: Fast, endTimestamp: number) {

        let prefix = ""

        if (fast.status == FastStatus.Completed || fast.status == FastStatus.Failed) {

            const endDate = DateTime.dateString(fast.currentEndTimestamp)

            prefix = `Completed **${endDate}**. `
        }

        const timestamp1 = fast.startTimestamp
        const timestamp2 = fast.currentEndTimestamp == 0 ? endTimestamp : fast.currentEndTimestamp

        let difference = ""
        let postfix = ""

        if (timestamp1 <= timestamp2) {

            difference = DateTime.timestampsDifference(timestamp1, timestamp2)
            postfix = ""
    
            if (endTimestamp <= fast.plannedEndTimestamp) {
                postfix = `left: **${DateTime.timestampsDifference(endTimestamp, fast.plannedEndTimestamp)}**`
            }
            else {
                postfix = `extra: **${DateTime.timestampsDifference(fast.plannedEndTimestamp, endTimestamp)}**`
            }
        }
        else {
            difference = "0h 0m"
            postfix = `left: **${fast.plannedLengthInHours}h**`
        }

        lines.push(`> ${prefix}Duration: **${difference}** (${postfix})`)
    }

    private static dateVerb(timestamp: number, pastForm: string, futureForm: string) {

        return timestamp > DateTime.now() ? futureForm : pastForm
    }

}