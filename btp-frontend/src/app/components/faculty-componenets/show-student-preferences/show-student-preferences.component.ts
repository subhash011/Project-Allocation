import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-show-student-preferences',
    templateUrl: './show-student-preferences.component.html',
    styleUrls: ['./show-student-preferences.component.scss']
})
export class ShowStudentPreferencesComponent implements OnInit {
    value: string = '';

    constructor(
        public dialogRef: MatDialogRef<ShowStudentPreferencesComponent>,
        @Inject(MAT_DIALOG_DATA) public preferences: any,
        private snackBar: MatSnackBar
    ) {
    }

    ngOnInit() {
        const projects = this.preferences.projects_preference;
        for (let index = 0; index < projects.length; index++) {
            const number = index + 1;
            const project = projects[index];
            this.value +=
                number +
                '. Project: ' +
                project.title +
                ' | ' +
                'Faculty name: ' +
                project.faculty_name +
                '\n';
        }
    }

    close() {
        this.dialogRef.close();
    }

    copied(event) {
        this.snackBar.open('Copied content to clipboard', 'Ok');
    }
}
