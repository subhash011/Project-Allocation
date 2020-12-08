import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-reset',
    templateUrl: './reset.component.html',
    styleUrls: ['./reset.component.scss'],
})
export class ResetComponent implements OnInit {
    constructor(public dialogRef: MatDialogRef<ResetComponent>) {
    }

    ngOnInit() {
    }

    onNoClick(): void {
        this.dialogRef.close({message: 'closed'});
    }

    onSubmit() {
        this.dialogRef.close({message: 'submit'});
    }
}
