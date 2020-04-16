import { FacultyComponent } from "./../faculty/faculty.component";
import { LoginComponent } from "./../../shared/login/login.component";
import { MatDialog } from "@angular/material/dialog";
import { ProjectsService } from "./../../../services/projects/projects.service";
import { Validators } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { Component, OnInit, Input, DoCheck } from "@angular/core";
import { SubmitPopUpComponent } from "../submit-pop-up/submit-pop-up.component";
import { MatSnackBar, MatSnackBarRef } from "@angular/material/snack-bar";
import { DeletePopUpComponent } from "../delete-pop-up/delete-pop-up.component";
import { Location } from "@angular/common";

@Component({
  selector: "app-content",
  templateUrl: "./content.component.html",
  styleUrls: ["./content.component.scss"],
  providers: [LoginComponent, FacultyComponent],
})
export class ContentComponent implements OnInit, DoCheck {
  @Input() public project;
  @Input() public add: boolean;
  @Input() public empty = true;
  @Input() public stream: string;
  @Input() public student_list;
  @Input() public programs_mode: boolean;
  @Input() public program_details;
  @Input() public routeParams;
  @Input() public adminStage;
  public id;

  Headers = ["Project Name", "#Students Applied", "#Students Alloted"];

  navigationSubscription;

  public ProjectForm = this.formBuilder.group({
    title: ["", Validators.required],
    duration: ["", Validators.required],
    studentIntake: ["", Validators.required],
    description: ["", Validators.required],
  });

  public EditForm = this.formBuilder.group({
    title: ["", Validators.required],
    duration: ["", Validators.required],
    studentIntake: ["", Validators.required],
    description: ["", Validators.required],
  });
  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private location: Location,
    private login: LoginComponent,
    private facultyComponent: FacultyComponent
  ) {}

  ngOnInit() {
    let id = localStorage.getItem("id");
    this.id = id;
  }

  ngDoCheck(): void {
    if (this.project) {
      this.EditForm.setValue({
        title: this.project.title,
        duration: this.project.duration,
        studentIntake: this.project.studentIntake,
        description: this.project.description,
      });
    }
  }

  onSubmit() {
    if (this.ProjectForm.valid) {
      const project = {
        title: this.ProjectForm.get("title").value,
        duration: this.ProjectForm.get("duration").value,
        studentIntake: this.ProjectForm.get("studentIntake").value,
        description: this.ProjectForm.get("description").value,
        stream: this.stream,
      };

      this.projectService.saveProject(project).subscribe((data) => {
        if (data["save"] == "success") {
          let snackBarRef = this.snackBar.open(data["msg"], "Ok", {
            duration: 3000,
          });

          snackBarRef.afterDismissed().subscribe(() => {
            this.router
              .navigateByUrl("/refresh", { skipLocationChange: true })
              .then(() => {
                this.router.navigate(["/faculty", this.id], {
                  queryParams: {
                    name: this.routeParams.name,
                    abbr: this.routeParams.abbr,
                    mode: "programMode",
                  },
                });
              });
          });

          snackBarRef.onAction().subscribe(() => {
            this.router
              .navigateByUrl("/refresh", { skipLocationChange: true })
              .then(() => {
                this.router.navigate(["/faculty", this.id], {
                  queryParams: {
                    name: this.routeParams.full,
                    abbr: this.routeParams.short,
                    mode: "programMode",
                  },
                });
              });
          });
        } else if (data["save"] == "projectCap") {
          //Go to the error page
          this.snackBar.open(data["msg"], "Ok", {
            duration: 3000,
          });
        } else if (data["save"] == "studentCap") {
          this.snackBar.open(data["msg"], "Ok", {
            duration: 3000,
          });
        } else if (data["save"] == "studentsPerFaculty") {
          this.snackBar.open(data["msg"], "Ok", {
            duration: 3000,
          });
        } else {
          let snackBarRef = this.snackBar.open(
            "Session Expired! Please Sign In Again",
            "OK",
            {
              duration: 3000,
            }
          );

          snackBarRef.afterDismissed().subscribe(() => {
            this.login.signOut();
          });

          snackBarRef.onAction().subscribe(() => {
            this.login.signOut();
          });
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
        project_id: param._id,
      };

      if (project.studentIntake > 0 && project.duration > 0) {
        if (this.dialog.openDialogs.length == 0) {
          let dialogRef = this.dialog.open(SubmitPopUpComponent, {
            height: "50%",
            width: "700px",
            data: project,
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result["message"] == "submit") {
              let snackBarRef = this.snackBar.open(
                "Successfully Updated",
                "Ok",
                {
                  duration: 3000,
                }
              );
              snackBarRef.afterDismissed().subscribe(() => {
                this.router
                  .navigateByUrl("/refresh", { skipLocationChange: true })
                  .then(() => {
                    this.router.navigate(["/faculty", this.id], {
                      queryParams: {
                        name: this.routeParams.name,
                        abbr: this.routeParams.abbr,
                        mode: "programMode",
                      },
                    });
                  });
              });
              snackBarRef.onAction().subscribe(() => {
                this.router
                  .navigateByUrl("/refresh", { skipLocationChange: true })
                  .then(() => {
                    this.router.navigate(["/faculty", this.id], {
                      queryParams: {
                        name: this.routeParams.name,
                        abbr: this.routeParams.abbr,
                        mode: "programMode",
                      },
                    });
                  });
              });
            } else if (result["message"] == "studentCap") {
              this.snackBar.open(result["msg"], "Ok", {
                duration: 3000,
              });
            } else if (result["message"] == "studentsPerFaculty") {
              this.snackBar.open(result["msg"], "Ok", {
                duration: 3000,
              });
            } else {
              let snackBarRef = this.snackBar.open(
                "Session Expired! Please Sign In Again",
                "OK",
                {
                  duration: 3000,
                }
              );

              snackBarRef.afterDismissed().subscribe(() => {
                this.login.signOut();
              });

              snackBarRef.onAction().subscribe(() => {
                this.login.signOut();
              });
            }
          });
        }
      } else {
        let snackBarRef = this.snackBar.open("Please Enter Valid Data", "OK", {
          duration: 3000,
        });
      }
    }
  }

  deleteProject(project) {
    if (this.dialog.openDialogs.length == 0) {
      let dialogRef = this.dialog.open(DeletePopUpComponent, {
        height: "200px",
        width: "400px",
        data: {
          message: "Are you sure you want to delete the project",
          heading: "Confirm Deletion",
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result["message"] == "submit") {
          this.projectService
            .deleteProject(project._id)
            .toPromise()
            .then((result) => {
              if (result["status"] == "success") {
                let snackBarRef = this.snackBar.open(
                  "Successfully Deleted",
                  "Ok",
                  {
                    duration: 3000,
                  }
                );
                snackBarRef.afterDismissed().subscribe(() => {
                  this.router
                    .navigateByUrl("/refresh", { skipLocationChange: true })
                    .then(() => {
                      this.router.navigate(["/faculty", this.id], {
                        queryParams: {
                          name: this.routeParams.name,
                          abbr: this.routeParams.abbr,
                          mode: "programMode",
                        },
                      });
                    });
                });
                snackBarRef.onAction().subscribe(() => {
                  this.router
                    .navigateByUrl("/refresh", { skipLocationChange: true })
                    .then(() => {
                      this.router.navigate(["/faculty", this.id], {
                        queryParams: {
                          name: this.routeParams.name,
                          abbr: this.routeParams.abbr,
                          mode: "programMode",
                        },
                      });
                    });
                });
              }
            });
        }
      });
    }
  }
}
