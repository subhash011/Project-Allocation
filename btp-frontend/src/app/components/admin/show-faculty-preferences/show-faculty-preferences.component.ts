import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: "app-show-faculty-preferences",
    templateUrl: "./show-faculty-preferences.component.html",
    styleUrls: [ "./show-faculty-preferences.component.scss" ]
})
export class ShowFacultyPreferencesComponent implements OnInit {
    value: string = "";

    constructor(
        public dialogRef: MatDialogRef<ShowFacultyPreferencesComponent>,
        @Inject(MAT_DIALOG_DATA) public preferences: any,
        private snackBar: MatSnackBar
    ) {}

    ngOnInit() {
        const projects = this.preferences.students_id;
        for (let index = 0; index < projects.length; index++) {
            const number = index + 1;
            const project = projects[index];
            this.value += number + ". Student: " + project.name + " | " + "Roll Number: " + project.roll_no + "\n";
        }
    }

    close() {
        this.dialogRef.close();
    }

    copied(event) {
        this.snackBar.open("Copied content to clipboard", "Ok");
    }
}
