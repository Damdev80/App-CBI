export interface IEvent {
    id?: string;
    title: string;
    description?: string | null ;
    eventDate: Date;
    createdAt?: Date;
    updatedAt?: Date;
}