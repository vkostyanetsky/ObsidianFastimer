export const enum FastStatus {
    Inactive = 1,
    Active,
    Failed,
    Completed,
}

export interface Fast {
    startTimestamp: number;
    plannedLength: number;
    currentLength: number;  
    plannedEndTimestamp: number;    
    currentEndTimestamp: number;    
    status: FastStatus;
}