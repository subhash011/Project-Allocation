import { Component, Inject, NgModule, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MaterialModule } from "src/app/material/material.module";

@Component({
    selector: "app-loader",
    templateUrl: "./loader.component.html",
    styleUrls: [ "./loader.component.scss" ]
})
export class LoaderComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<LoaderComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

    ngOnInit() {}
}

@NgModule({
    imports: [
        MaterialModule
    ],
    declarations: [
        LoaderComponent
    ],
    exports: [
        LoaderComponent
    ],
    providers: [
        {
            provide: MatDialogRef,
            useValue: {}
        }
    ]
})
export class LoaderModule {}
