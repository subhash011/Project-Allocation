import { UserService } from "src/app/services/user/user.service";
import { FacultyComponent } from "./../faculty/faculty.component";
import { LoginComponent } from "./../../shared/login/login.component";
import { MatDialog } from "@angular/material/dialog";
import { ProjectsService } from "./../../../services/projects/projects.service";
import { Validators } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { Component, OnInit, Input, DoCheck, PipeTransform, Pipe } from "@angular/core";
import { SubmitPopUpComponent } from "../submit-pop-up/submit-pop-up.component";
import { MatSnackBar, MatSnackBarRef } from "@angular/material/snack-bar";
import { DeletePopUpComponent } from "../delete-pop-up/delete-pop-up.component";
import { Location } from "@angular/common";
import { LoaderComponent } from "../../shared/loader/loader.component";
import { ShowStudentAllotedComponent } from '../show-student-alloted/show-student-alloted.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidenavComponent } from '../sidenav/sidenav.component';


@Pipe({
  name: "displayFacultyPublish",
})
export class FacultyPublish implements PipeTransform {
  transform(student) {
    return `${student.name} (${student.roll_no})`
  }
}


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
  @Input() public publishFaculty;
  @Input() public publishStudents;
  @Input() public non_student_list;
  @Input() public reorder;
  public id;
  public index = 0;

  Headers =  [
    "Program",
    "Project",
    "StudentsApplied",
    "StudentIntake",
    "StudentsAlloted",
  ];

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
    private userService: UserService,
    private login: LoginComponent,
    private navbar: NavbarComponent
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

  displayHome() {
    let id = localStorage.getItem("id");
    this.router
      .navigateByUrl("/refresh", { skipLocationChange: true })
      .then(() => {
        this.router.navigate(["/faculty", id], {
          queryParams: {
            name: this.routeParams.name,
            abbr: this.routeParams.abbr,
            mode: "programMode",
          },
        });
      });
  }

  onSubmit() {
    if (this.ProjectForm.valid) {
      const project = {
        title: this.ProjectForm.get("title").value.replace(/  +/g,' '),
        duration: this.ProjectForm.get("duration").value,
        studentIntake: this.ProjectForm.get("studentIntake").value,
        description: this.ProjectForm.get("description").value.replace(/  +/g,' '),
        stream: this.stream,
      };
      var dialogRef = this.dialog.open(LoaderComponent, {
        data: "Loading Please Wait ....",
        disableClose: true,
        hasBackdrop: true,
      });
      if (project.studentIntake > 0 && project.duration > 0) {
        this.projectService.saveProject(project).subscribe((data) => {
          dialogRef.close();
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
            this.navbar.role = "none"
            this.snackBar.open(
              "Session Timed Out! Please Sign-In again",
              "Ok",
              {
                duration: 3000,
              }
            );
            this.login.signOut();
          }
        },() => {
          dialogRef.close();
          this.ngOnInit();
          this.snackBar.open("Some Error Occured! Try again later.", "OK", {
            duration: 3000,
          });
        });
      } else {
        this.snackBar.open("Please Enter Valid Data", "OK", {
          duration: 3000,
        });
      }
    }
  }

  onEditSubmit(param) {
    if (this.EditForm.valid) {
      const project = {
        title: this.EditForm.get("title").value.replace(/  +/g,' '),
        duration: this.EditForm.get("duration").value,
        studentIntake: this.EditForm.get("studentIntake").value,
        description: this.EditForm.get("description").value.replace(/  +/g,' '),
        project_id: param._id,
      };

      if (project.studentIntake > 0 && project.duration > 0) {
        if (this.dialog.openDialogs.length == 0) {
          let dialogRef = this.dialog.open(SubmitPopUpComponent, {
            height: "20%",
            width: "400px",
            data: project,
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
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
              } else if (result["message"] == "closed") {
              } else {
                this.navbar.role = "none"
                this.snackBar.open(
                  "Session Timed Out! Please Sign-In again",
                  "Ok",
                  {
                    duration: 3000,
                  }
                );
                this.login.signOut();
              }
            }
          });
        }
      } else {
        this.snackBar.open("Please Enter Valid Data", "OK", {
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
        if (result) {
          if (result["message"] == "submit") {
            var dialogRef = this.dialog.open(LoaderComponent, {
              data: "Please wait ....",
              disableClose: true,
              hasBackdrop: true,
            });

            this.projectService
              .deleteProject(project._id)
              .toPromise()
              .then((result) => {
                dialogRef.close();
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
                  },() => {
                    dialogRef.close();
                    this.ngOnInit();
                    this.snackBar.open("Some Error Occured! Try again later.", "OK", {
                      duration: 3000,
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
        }
      });
    }
  }

  sortProjectDetails(event){
    const isAsc = event.direction == "asc";
    this.program_details = this.program_details.sort((a, b) => {
      switch (event.active) {
        case "Program":
          return this.compare(a.stream, b.stream, isAsc);
        case "Project":
          return this.compare(a.stage, b.stage, isAsc);
        case "Project":
          return this.compare(a.title, b.title, isAsc);
        case "StudentIntake":
          return this.compare(a.studentIntake, b.studentIntake, isAsc);
        case "StudentsApplied":
          return this.compare(a.noOfPreferences, b.noOfPreferences, isAsc);
        default:
          return 0;
      }
    }); 
    this.program_details = [...this.program_details]
  }

  compare(
    a: number | string | boolean,
    b: number | string | boolean,
    isAsc: boolean
  ) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }




}
