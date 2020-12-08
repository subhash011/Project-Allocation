import { CdkDragDrop, moveItemInArray, transferArrayItem, } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoginComponent } from 'src/app/components/shared/login/login.component';

@Component({
    selector: 'app-show-preferences',
    templateUrl: './show-preferences.component.html',
    styleUrls: ['./show-preferences.component.scss'],
    providers: [LoginComponent],
})
export class ShowPreferencesComponent implements OnInit {
    constructor(
        public dialogRef: MatDialogRef<ShowPreferencesComponent>,
        @Inject(MAT_DIALOG_DATA) public preferences: any
    ) {
    }

    ngOnInit() {
    }

    onNoClick(): void {
        this.dialogRef.close({message: 'closed'});
    }

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            this.preferences = event.container.data;
            moveItemInArray(
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        }
    }

    savePreferences() {
        this.dialogRef.close({message: 'submit', result: this.preferences});
    }
}
