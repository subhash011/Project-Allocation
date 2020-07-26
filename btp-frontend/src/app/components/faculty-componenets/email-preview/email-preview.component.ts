import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ProjectsService } from 'src/app/services/projects/projects.service';

@Component({
  selector: 'app-email-preview',
  templateUrl: './email-preview.component.html',
  styleUrls: ['./email-preview.component.scss']
})
export class EmailPreviewComponent implements OnInit {

  constructor(
    private projectService: ProjectsService,
    public dialogRef: MatDialogRef<EmailPreviewComponent>,
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
