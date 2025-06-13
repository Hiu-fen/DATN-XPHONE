export interface IBanner {
    _id: string;
    name: string;
    description: string;
    imageUrl: string;
    link: string;
    startDate: Date;
    endDate: Date;
    status: boolean;
    order: number;
}