import { Directive, ElementRef, Input } from "@angular/core";
import { CdkDrag } from "@angular/cdk/drag-drop";

@Directive({
    selector: "[cdkDrag][actualContainer]"
})
export class CdkDropListActualContainer {
    @Input("actualContainer") actualContainer: string;
    originalElement: ElementRef<HTMLElement>;

    constructor(cdkDrag: CdkDrag) {
        cdkDrag._dragRef.beforeStarted.subscribe(() => {
            const cdkDropList = cdkDrag.dropContainer;
            if (!this.originalElement) {
                this.originalElement = cdkDropList.element;
            }
            if (this.actualContainer) {
                const element = this.originalElement.nativeElement.closest(this.actualContainer) as HTMLElement;
                cdkDropList._dropListRef.element = element;
                cdkDropList.element = new ElementRef<HTMLElement>(element);
            } else {
                cdkDropList._dropListRef.element = cdkDropList.element.nativeElement;
                cdkDropList.element = this.originalElement;
            }
        });
    }
}
