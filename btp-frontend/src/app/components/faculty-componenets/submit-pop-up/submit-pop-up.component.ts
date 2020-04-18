import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ProjectsService } from "src/app/services/projects/projects.service";

@Component({
  selector: "app-submit-pop-up",
  templateUrl: "./submit-pop-up.component.html",
  styleUrls: ["./submit-pop-up.component.scss"],
})
export class SubmitPopUpComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private projectService: ProjectsService,
    private dialogRef: MatDialogRef<SubmitPopUpComponent>
  ) {}

  ngOnInit() {}
  onNoClick(): void {
    this.dialogRef.close({ message: "closed" });
  }
  onSubmit() {
    this.projectService.updateProject(this.data).subscribe((data) => {
      if (data["status"] == "success") {
        this.dialogRef.close({ message: "submit" });
      } else if (data["status"] == "fail1") {
        this.dialogRef.close({ message: "studentCap", msg: data["msg"] });
      } else if (data["status"] == "fail2") {
        this.dialogRef.close({
          message: "studentsPerFaculty",
          msg: data["msg"],
        });
      } else {
        this.dialogRef.close({ message: "fail" });
      }
    });
  }
}
