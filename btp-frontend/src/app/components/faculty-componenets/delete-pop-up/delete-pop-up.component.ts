import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: "app-delete-pop-up",
    templateUrl: "./delete-pop-up.component.html",
    styleUrls: ["./delete-pop-up.component.scss"],
})
export class DeletePopUpComponent implements OnInit {
    constructor(
        public dialogRef: MatDialogRef<DeletePopUpComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    ngOnInit() {}

    onNoClick(): void {
        this.dialogRef.close({ message: "closed" });
    }

    onSubmit() {
        this.dialogRef.close({ message: "submit" });
    }
}
