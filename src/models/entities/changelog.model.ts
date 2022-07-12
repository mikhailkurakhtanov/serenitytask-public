export class Changelog {
    id: number;
    creationDateString: string;
    changes: string;
    version: string;

    // not related to entity properties
    changesItems: string[];
    creationDate: Date;
    displayDate: string;
}