export default class TsAutocomplete {
    private selector;
    private wrapperElement;
    private inputElement;
    private resetButtonElement;
    private items;
    private uri;
    private currentFocus;
    private makeSearchCall;
    private loaderElement;
    private onSelect;
    private onReset;
    constructor(selector: string, onSelect?: Function, onReset?: Function);
    private setupAutocomplete;
    private attachEventHandlers;
    private generateItemsList;
    private showResetButton;
    private hideResetButton;
    private lockSearch;
    private unlockSearch;
    private addActive;
    private static removeActive;
    private closeAllLists;
    static performAsyncRequest(url: string, data: any, callback: Function): void;
}
