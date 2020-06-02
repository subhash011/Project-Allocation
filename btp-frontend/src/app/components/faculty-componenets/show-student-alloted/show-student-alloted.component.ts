import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-show-student-alloted',
  templateUrl: './show-student-alloted.component.html',
  styleUrls: ['./show-student-alloted.component.scss']
})
export class ShowStudentAllotedComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ShowStudentAllotedComponent>,
    @Inject(MAT_DIALOG_DATA) public project: any,
  ) { }

  ngOnInit() {}

  close() {
    this.dialogRef.close();
  }
}
