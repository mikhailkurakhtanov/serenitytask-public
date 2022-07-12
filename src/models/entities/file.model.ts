export class File {
    id: number;
    name: string;
    uploadDate: Date;
    extension: string;
    size: number;

    //non realted to entity properties
    isDownloadButtonClicked: boolean;
    isDeleteButtonClicked: boolean;
}