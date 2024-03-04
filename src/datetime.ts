import { moment } from "obsidian"

export default class DateTime {

    public static now() {

        return Date.now() / 1000
    }
    
    public static secondsInHours(hours: number) {
    
        return hours * 60 * 60
    }    
    
    public static timestampToString(ts: number) {
    
        return moment(new Date(ts * 1000)).format("YYYY-MM-DD HH:mm")
    }
    
    public static timestampsDifference(timestamp1: number, timestamp2: number) {
        
        let seconds = timestamp2 - timestamp1
        let hours = Math.floor(seconds / 3600)
        let minutes = Math.floor(
            (seconds - (hours * 3600)) / 60
        )
    
        return `${hours}h ${minutes}m`
    }

}