import { Component, Host, Input, OnInit, Optional } from "@angular/core";
import { SatPopover } from "@ncstate/sat-popover";
import { filter } from "rxjs/operators";

@Component({
    selector: "app-inline-edit",
    templateUrl: "./inline-edit.component.html",
    styleUrls: ["./inline-edit.component.scss"],
})
export class InlineEditComponent implements OnInit {
    @Input() head: string = "Edit this Field";
    @Input() placeholder: string = "New value";
    /** Form model for the input. */
    comment = "";

    constructor(@Optional() @Host() public popover: SatPopover) {}

    private _value = "";

    @Input()
    get value(): string {
        return this._value;
    }

    set value(x: string) {
        this.comment = this._value = x;
    }

    ngOnInit() {
        // subscribe to cancellations and reset form value
        if (this.popover) {
            this.popover.closed
                .pipe(filter((val) => val == null))
                .subscribe(() => (this.comment = this.value || ""));
        }
    }

    onSubmit() {
        if (this.popover) {
            this.popover.close({ message: "submit", value: this.comment });
        }
    }

    onCancel() {
        if (this.popover) {
            this.popover.close({ messsage: "close" });
        }
    }
}
