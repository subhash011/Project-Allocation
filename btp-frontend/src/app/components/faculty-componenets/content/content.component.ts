import { MatDialog } from "@angular/material/dialog";
import { ProjectsService } from "./../../../services/projects/projects.service";
import { Validators } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Component, OnInit, Input } from "@angular/core";
import { SubmitPopUpComponent } from "../submit-pop-up/submit-pop-up.component";
import { MatSnackBar, MatSnackBarRef } from "@angular/material/snack-bar";
import { DeletePopUpComponent } from "../delete-pop-up/delete-pop-up.component";

@Component({
  selector: "app-content",
  templateUrl: "./content.component.html",
  styleUrls: ["./content.component.scss"]
})
export class ContentComponent implements OnInit {
  @Input() public project;
  @Input() public add: boolean;
  @Input() public empty = true;
  @Input() public stream: string;
  @Input() public student_list;

  public ProjectForm = this.formBuilder.group({
    title: ["", Validators.required],
    duration: ["", Validators.required],
    studentIntake: ["", Validators.required],
    description: ["", Validators.required]
  });

  public EditForm = this.formBuilder.group({
    title: ["", Validators.required],
    duration: ["", Validators.required],
    studentIntake: ["", Validators.required],
    description: ["", Validators.required]
  });
  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private projectService: ProjectsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {}
  onSubmit() {
    if (this.ProjectForm.valid) {
      const project = {
        title: this.ProjectForm.get("title").value,
        duration: this.ProjectForm.get("duration").value,
        studentIntake: this.ProjectForm.get("studentIntake").value,
        description: this.ProjectForm.get("description").value,
        stream: this.stream
      };
      let dialogRef = this.dialog.open(DeletePopUpComponent, {
        height: "200px",
        width: "400px",
        data: "add the project"
      });
      dialogRef.afterClosed().subscribe(res => {
        if (res["message"] == "submit") {
          this.projectService.saveProject(project).subscribe(data => {
            if (data["save"] == "success") {
              this.empty = true;
            } else {
              this.empty = false;
            }
            this.snackBar.open("Successfully Added Project", "Ok", {
              duration: 3000
            });
          });
        }
      });
    }
  }

  onEditSubmit(param) {
    // console.log(param);
    if (this.EditForm.valid) {
      const project = {
        title: this.EditForm.get("title").value,
        duration: this.EditForm.get("duration").value,
        studentIntake: this.EditForm.get("studentIntake").value,
        description: this.EditForm.get("description").value,
        project_id: param._id
      };
      let dialogRef = this.dialog.open(SubmitPopUpComponent, {
        height: "60%",
        width: "800px",
        data: project
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result["message"] == "submit") {
          this.EditForm.reset();

          this.snackBar.open("Successfully Edited Project", "Ok", {
            duration: 3000
          });
          this.EditForm.reset();
        }
      });
    }
  }

  deleteProject(project) {
    let dialogRef = this.dialog.open(DeletePopUpComponent, {
      height: "200px",
      width: "400px",
      data: "delete the project"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result["message"] == "submit") {
        this.projectService.deleteProject(project._id).subscribe(data => {
          this.snackBar.open("Successfully Deleted Project", "Ok", {
            duration: 3000
          });
        });
      }
    });
  }
}
