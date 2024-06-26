import { 
    MarkdownPostProcessorContext,
} from 'obsidian';

import { 
    FastimerSettings,
    DEFAULT_SETTINGS 
} from './settings';

import {
    Fast,
    FastStatus
} from './types'

import DateTime from 'src/datetime';

export default class FastsParser {

    public static fast(content: string, ctx: MarkdownPostProcessorContext, settings: FastimerSettings) {

        const fast: Fast = {
            startTimestamp: 0,
            plannedLengthInHours: 0,
            plannedLength: 0,
            currentLength: 0,
            plannedEndTimestamp: 0,
            currentEndTimestamp: 0,            
            status: FastStatus.Inactive,
        }

        this.initFastFromContent(fast, content)
        
        this.fillFastPlannedLengthInHours(fast, settings)

        this.fillFastPlannedLength(fast)
        this.fillFastCurrentLength(fast)

        this.fillFastPlannedEndTimestamp(fast)

        this.fillFastStatus(fast)

        return fast;
    }    

    private static initFastFromContent(fast: Fast, content: string) {
        const lines = content.split("\n");

        lines.forEach(line => {

            line = line.trim()

            if (line.match(/^\d*$/)) {
                const intValue = parseInt(line)

                if (! isNaN(intValue) && fast.plannedLengthInHours == 0) {
                    fast.plannedLengthInHours = intValue
                }
            }
            else if (line.match(/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}$/)) {
                const dateValue = Date.parse(line)

                if (! isNaN(dateValue)) {

                    if (fast.startTimestamp == 0) {
                        fast.startTimestamp = dateValue
                    }
                    else if (fast.currentEndTimestamp == 0) {
                        fast.currentEndTimestamp = dateValue
                    }                    
                }
            }
        })
    }

    private static fillFastPlannedLengthInHours(fast: Fast, settings: FastimerSettings) {

        if (fast.plannedLengthInHours == 0) {
            fast.plannedLengthInHours = settings.regularFastLength

            if (fast.plannedLengthInHours == 0) {            
                fast.plannedLengthInHours = DEFAULT_SETTINGS.regularFastLength
            }
        }
    }

    private static fillFastPlannedLength(fast: Fast) {

        if (fast.plannedLength == 0) {
            fast.plannedLength = DateTime.HoursToMs(fast.plannedLengthInHours)
        }
    }

    private static fillFastCurrentLength(fast: Fast) {

        const finished = fast.currentEndTimestamp == 0 ? Date.now() : fast.currentEndTimestamp

        fast.currentLength = finished - fast.startTimestamp
    }

    private static fillFastPlannedEndTimestamp(fast: Fast) {

        fast.plannedEndTimestamp = fast.startTimestamp + fast.plannedLength
    }

    private static fillFastStatus(fast: Fast) {

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

}