import { Component, EventEmitter, Host, Input, OnInit, Optional, Output } from "@angular/core";
import { SatPopover } from "@ncstate/sat-popover";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
    selector: "edit-form", styleUrls: [ "edit-form.component.scss" ], templateUrl: "./edit-form.component.html"
})
export class EditFormComponent implements OnInit {
    @Input() full = "";
    @Input() short = "";
    @Input() which;
    @Output() update = new EventEmitter<any>();
    addForm = this.fb.group({
        full: [
            this.full,
            Validators.required
        ], short: [
            this.short,
            Validators.compose([
                Validators.required,
                Validators.pattern("[a-zA-Z-_]*")
            ])
        ]
    });

    constructor(private fb: FormBuilder, @Optional() @Host() public popover: SatPopover) {}

    ngOnInit() {
        for (const key of Object.keys(this.addForm.controls)) {
            const control = this.addForm.controls[key];
            control.setValue(key == "full" ? this.full : this.short);
        }
    }

    onSubmit() {
        if (this.popover && this.addForm.valid) {
            const map = {
                full: this.addForm.get("full").value, short: this.addForm.get("short").value.toUpperCase()
            };
            this.update.next(map);
            this.popover.close();
        }
    }

    onNoClick() {
        if (this.popover) {
            this.popover.close();
        }
    }
}
