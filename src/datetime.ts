import { moment } from "obsidian"

export default class DateTime {

    public static now() {

        return Date.now()
    }
    
    public static DaysToMs(daysNumber: number) {

        return this.HoursToMs(24) * daysNumber
    }

    public static HoursToMs(hoursNumber: number) {
    
        return hoursNumber * 60 * 60 * 1000
    }    

    private static relativeDateString(dateMoment: moment.Moment) {

        const isoString = this.momentToISOString(dateMoment)
        
        const day = this.relativeDateStrings().get(isoString)

        if (day != undefined) {
            const time = dateMoment.format("HH:mm")

            return `${day}, ${time}`
        }
        else {
            return undefined
        }
    }

    private static relativeDateStrings() {

        let result = new Map<string, string>([])
                
        result.set(this.shiftInDaysToString(-3), "3 days ago")
        result.set(this.shiftInDaysToString(-2), "2 days ago")
        result.set(this.shiftInDaysToString(-1), "yesterday")
        result.set(this.shiftInDaysToString( 0), "today")
        result.set(this.shiftInDaysToString( 1), "tomorrow")
        result.set(this.shiftInDaysToString( 2), "2 days later")
        result.set(this.shiftInDaysToString( 3), "3 days later")

        return result
    }

    private static shiftInDaysToString(daysNumber: number) {

        const timestamp = this.now() + this.DaysToMs(daysNumber)
        const timestampMoment = moment(new Date(timestamp))

        return this.momentToISOString(timestampMoment)
    }

    private static momentToISOString(dateMoment: moment.Moment) {

        return moment(dateMoment).format("YYYY-MM-DD")
    }

    public static dateString(timestamp: number, relative: boolean = true) {
    
        const dateMoment = moment(new Date(timestamp))

        let result = dateMoment.format("YYYY-MM-DD HH:mm")

        if (relative) {
            const dateString = this.relativeDateString(dateMoment)

            if (dateString != undefined) {
                result = dateString
            }
        }

        return result
    }

    public static timestampsDifference(timestamp1: number, timestamp2: number) {
        
        let seconds = timestamp2 / 1000 - timestamp1 / 1000
        let hours = Math.floor(seconds / 3600)
        let minutes = Math.floor(
            (seconds - (hours * 3600)) / 60
        )
    
        return `${hours}h ${minutes}m`
    }

}