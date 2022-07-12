import { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import { faCheckSquare as faCheckSelected } from "@fortawesome/free-solid-svg-icons";
import { faCheckSquare as faCheckNotSelected } from "@fortawesome/free-regular-svg-icons";

export class UserSearchOption {
    name: string;
    selected: boolean;
    icon: IconDefinition;

    constructor(customName: string) {
        this.name = customName;
        this.selected = false;
        this.icon = faCheckNotSelected;
        return this;
    }

    updateSelectedState(forceState: boolean | null = null) {
        this.selected = forceState !== null ? forceState : !this.selected;
        this.icon = this.selected ? faCheckSelected : faCheckNotSelected;
    }
}