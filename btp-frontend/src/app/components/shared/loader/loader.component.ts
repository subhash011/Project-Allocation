import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: "app-loader",
    templateUrl: "./loader.component.html",
    styleUrls: [ "./loader.component.scss" ]
})
export class LoaderComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<LoaderComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

    ngOnInit() {}
}
