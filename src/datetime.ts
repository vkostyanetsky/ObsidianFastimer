import { moment } from "obsidian"

export default class DateTime {

    public static now() {

        return Date.now()
    }
    
    public static millisecondsInHours(hours: number) {
    
        return hours * 60 * 60 * 1000
    }    
    
    public static timestampToString(timestamp: number) {
    
        const date = new Date(timestamp)

        return moment(date).format("YYYY-MM-DD HH:mm")
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