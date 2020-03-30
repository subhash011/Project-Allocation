import { MatDialog } from "@angular/material/dialog";
import { ProjectsService } from "./../../../services/projects/projects.service";
import { Validators } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { Component, OnInit, Input } from "@angular/core";
import { SubmitPopUpComponent } from "../submit-pop-up/submit-pop-up.component";
import { MatSnackBar, MatSnackBarRef } from "@angular/material/snack-bar";
import { DeletePopUpComponent } from "../delete-pop-up/delete-pop-up.component";
import { Location } from "@angular/common";

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

  navigationSubscription;

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
    private formBuilder: FormBuilder,
    private projectService: ProjectsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private location: Location
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

      this.projectService.saveProject(project).subscribe(data => {
        if (data["save"] == "success") {
          let snackBarRef = this.snackBar.open(data["msg"], "Ok", {
            duration: 3000
          });
          snackBarRef.afterDismissed().subscribe(() => {
            this.router
              .navigateByUrl("/refresh", { skipLocationChange: true })
              .then(() => {
                this.router.navigate([decodeURI(this.location.path())]);
              });
          });

          snackBarRef.onAction().subscribe(() => {
            this.router
              .navigateByUrl("/refresh", { skipLocationChange: true })
              .then(() => {
                this.router.navigate([decodeURI(this.location.path())]);
              });
          });
        } else {
          //Go to the error page
        }
      });
    }
  }

  onEditSubmit(param) {
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
          let snackBarRef = this.snackBar.open("Successfully Updated", "Ok", {
            duration: 3000
          });
          snackBarRef.afterDismissed().subscribe(() => {
            this.router
              .navigateByUrl("/refresh", { skipLocationChange: true })
              .then(() => {
                this.router.navigate([decodeURI(this.location.path())]);
              });
          });

          snackBarRef.onAction().subscribe(() => {
            this.router
              .navigateByUrl("/refresh", { skipLocationChange: true })
              .then(() => {
                this.router.navigate([decodeURI(this.location.path())]);
              });
          });
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
        let snackBarRef = this.snackBar.open("Successfully Deleted", "Ok", {
          duration: 3000
        });
        snackBarRef.afterDismissed().subscribe(() => {
          this.router
            .navigateByUrl("/refresh", { skipLocationChange: true })
            .then(() => {
              this.router.navigate([decodeURI(this.location.path())]);
            });
        });
        snackBarRef.onAction().subscribe(() => {
          this.router
            .navigateByUrl("/refresh", { skipLocationChange: true })
            .then(() => {
              this.router.navigate([decodeURI(this.location.path())]);
            });
        });
      }
    });
  }
}
