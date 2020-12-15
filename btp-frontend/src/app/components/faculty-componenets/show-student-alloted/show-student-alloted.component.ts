import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-show-student-alloted',
    templateUrl: './show-student-alloted.component.html',
    styleUrls: ['./show-student-alloted.component.scss']
})
export class ShowStudentAllotedComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<ShowStudentAllotedComponent>,
        @Inject(MAT_DIALOG_DATA) public project: any
    ) {
    }

    ngOnInit() {
    }

    close() {
        this.dialogRef.close();
    }
}
