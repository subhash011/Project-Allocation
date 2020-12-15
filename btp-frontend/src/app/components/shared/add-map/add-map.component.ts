import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-add-map',
    templateUrl: './add-map.component.html',
    styleUrls: ['./add-map.component.scss']
})
export class AddMapComponent implements OnInit {
    addForm = this.fb.group({
        full: [null, Validators.required],
        short: [
            null,
            Validators.compose([
                Validators.required,
                Validators.pattern('[a-zA-Z-_]*')
            ])
        ]
    });

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<AddMapComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
    }

    ngOnInit() {
    }

    onNoClick() {
        this.dialogRef.close({message: 'close'});
    }

    onSubmit() {
        if (this.addForm.valid) {
            const map = {
                full: this.addForm.get('full').value,
                short: this.addForm.get('short').value.toUpperCase()
            };
            this.dialogRef.close({map: map, message: 'submit'});
        }
    }
}
