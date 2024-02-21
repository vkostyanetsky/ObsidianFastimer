export default class DateTime {

    public static now() {

        return Date.now() / 1000
    }
    
    public static secondsInHours(hours: number) {
    
        return hours * 60 * 60
    }    
    
    public static timestampToString(ts: number) {
    
        let dateStrings = new Date(ts * 1000).toLocaleString(
            "en-UK", 
            {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                hour12: false,
                minute: '2-digit',
                hourCycle: 'h23',
            }
        ).split(", ")
    
        let day     = dateStrings[0].substring(0, 2);
        let month   = dateStrings[0].substring(3, 5);
        let year    = dateStrings[0].substring(6, 10); 
        let time    = dateStrings[1]
    
        return `${year}-${month}-${day} ${time}`
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