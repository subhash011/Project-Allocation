import { ProjectsService } from "./../../../services/projects/projects.service";
import { LoginComponent } from "./../../shared/login/login.component";
import { MailService } from "./../../../services/mailing/mail.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeletePopUpComponent } from "./../delete-pop-up/delete-pop-up.component";
import { MatDialog } from "@angular/material/dialog";
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { UserService } from "src/app/services/user/user.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatStepper } from "@angular/material";
import { Location } from "@angular/common";
import { identifierModuleUrl } from "@angular/compiler";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
  providers: [LoginComponent],
})
export class AdminComponent implements OnInit {
  public details; // For displaying the projects tab
  public faculty_projects;

  columns: string[] = [
    "Title",
    "Description",
    "Faculty",
    "Duration",
    "NoOfStudents",
    "Student",
  ];

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;
  fifthFormGroup: FormGroup;

  public stage_no;
  dateSet = [];
  curr_deadline;
  startDate;
  minDate;
  projects: any = [];
  background = "primary";
  //Buttons
  proceedButton1 = true;
  proceedButton2 = true;
  proceedButton3 = true;

  projectCap;
  days_left;
  project: any;

  @ViewChild("stepper", { static: false }) stepper: MatStepper;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private mailer: MailService,
    private projectService: ProjectsService,
    private loginService: LoginComponent
  ) {
    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: [this.dateSet[0]],
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: [this.dateSet[1]],
    });
    this.thirdFormGroup = this.formBuilder.group({
      thirdCtrl: [this.dateSet[2]],
    });
    this.fourthFormGroup = this.formBuilder.group({
      fourthCtrl: [this.dateSet[3]],
    });
    this.fifthFormGroup = this.formBuilder.group({
      fifthCtrl: [this.projectCap],
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      for (let step = 0; step < this.stage_no; step++) {
        this.stepper.next();
      }
    });
  }

  ngOnInit(marker = false) {
    this.userService.getAdminInfo().subscribe((data) => {
<<<<<<< HEAD
      // console.log(data);
=======
>>>>>>> subhash
      this.stage_no = data["stage"];

      this.dateSet = data["deadlines"];
      this.projectCap = data["projectCap"];
      // this.curr_deadline = this.dateSet[this.dateSet.length - 1];
      this.dateSet = this.dateSet.map((date) => {
        return new Date(date);
      });
      this.startDate = data["startDate"];

      if (!marker) this.ngAfterViewInit();

      this.firstFormGroup.controls["firstCtrl"].setValue(this.dateSet[0]);
      this.secondFormGroup.controls["secondCtrl"].setValue(this.dateSet[1]);
      this.thirdFormGroup.controls["thirdCtrl"].setValue(this.dateSet[2]);
      this.fifthFormGroup.controls["fifthCtrl"].setValue(this.projectCap);

      if (this.dateSet.length == 1) {
        if (this.firstFormGroup.controls["firstCtrl"]) {
          this.proceedButton1 = false;
        }
      }
      if (this.dateSet.length == 2) {
        if (this.secondFormGroup.controls["secondCtrl"]) {
          this.proceedButton2 = false;
        }
      }
      if (this.dateSet.length == 3) {
        if (this.thirdFormGroup.controls["thirdCtrl"])
          this.proceedButton3 = false;
      }
      if (this.stage_no == 0) {
        this.minDate = new Date();
      } else {
        this.minDate = this.dateSet[this.dateSet.length - 1];
      }
      this.userService.Admin_getStreamDetails().subscribe((data) => {
<<<<<<< HEAD
        // console.log(data);
=======
>>>>>>> subhash
        this.details = data["project_details"];
        if (this.dateSet.length > 0) {
          this.curr_deadline = this.dateSet[this.dateSet.length - 1];
          let today = new Date();
          this.days_left = this.daysBetween(today, this.curr_deadline);
        }
      });
    });
    this.projectService.getAllStreamProjects().subscribe((projects) => {
      if (projects["message"] == "success") {
        this.projects = projects["result"];
      } else {
        this.loginService.signOut();
        this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
          duration: 3000,
        });
      }
    });
  }

  proceed() {
    const dialogRef = this.dialog.open(DeletePopUpComponent, {
      width: "400px",
      height: "250px",
      data: {
        heading: "Confirm Proceed",
        message:
          "Are you sure you want to proceed to the next stage? This cannot be undone",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result["message"] == "submit") {
        this.stage_no++;
        this.stepper.next();
        this.proceedButton1 = true;
        this.proceedButton2 = true;
        this.proceedButton3 = true;
        this.userService.updateStage(this.stage_no).subscribe((data) => {
          if (data["status"] == "success") {
            this.days_left = "Please Set the deadline";

            let snackBarRef = this.snackBar.open(
              "SuccessFully moved to the next stage!",
              "Ok",
              {
                duration: 3000,
              }
            );
          } else {
            let snackBarRef = this.snackBar.open(
              "Session Timed Out! Sign-in again",
              "Ok",
              {
                duration: 3000,
              }
            );
            snackBarRef.afterDismissed().subscribe(() => {
              this.loginService.signOut();
            });
            snackBarRef.onAction().subscribe(() => {
              this.loginService.signOut();
            });
          }
        });
      }
    });
  }

  daysBetween(date1, date2) {
    console.log(date2.getTime());
    let diffInMilliSeconds = Math.abs(date2 - date1) / 1000;

    // calculate days
    const days = Math.floor(diffInMilliSeconds / 86400);
    diffInMilliSeconds -= days * 86400;

    // calculate hours
    const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
    diffInMilliSeconds -= hours * 3600;

    // calculate minutes
    const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
    diffInMilliSeconds -= minutes * 60;

    let difference = "";
    if (days > 0) {
      difference += days === 1 ? `${days} day, ` : `${days} days, `;
    }

    difference +=
      hours === 0 || hours === 1 ? `${hours} hour, ` : `${hours} hours, `;

    difference +=
      minutes === 0 || hours === 1
        ? `${minutes} minutes`
        : `${minutes} minutes`;

    difference += ", " + Math.floor(diffInMilliSeconds) + " seconds";

    return difference;
  }

  setDeadline() {
    this.curr_deadline = this.dateSet[this.dateSet.length - 1];

    if (this.stage_no == 0) {
      var date = this.firstFormGroup.get("firstCtrl").value;
    } else if (this.stage_no == 1) {
      var date = this.secondFormGroup.get("secondCtrl").value;
    } else if (this.stage_no == 2) {
      var date = this.thirdFormGroup.get("thirdCtrl").value;
    }


    if (date != null && date != "") {
      const dialogRef = this.dialog.open(DeletePopUpComponent, {
        width: "400px",
        height: "250px",
        data: {
          heading: "Confirm Deadline",
          message: "Are you sure you want to fix the deadline?",
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result["message"] == "submit") {

          this.userService.setDeadline(date).subscribe((data) => {
            if (data["status"] == "success") {
              let snackBarRef = this.snackBar.open(
                "Deadline set successfully!!",
                "Ok",
                {
                  duration: 3000,
                }
              );

              snackBarRef.afterDismissed().subscribe(() => {
                this.ngOnInit(true);
              });
              snackBarRef.onAction().subscribe(() => {
                this.ngOnInit(true);
              });
            } else {
              let snackBarRef = this.snackBar.open(
                "Please Reload and Try Again!",
                "Ok",
                {
                  duration: 3000,
                }
              );
              // snackBarRef.afterDismissed().subscribe(() => {
              //   this.loginService.signOut();
              // });
              // snackBarRef.onAction().subscribe(() => {
              //   this.loginService.signOut();
              // });
            }
          });
        }
      });
    } else {
      //Snack bar
      let snackBarRef = this.snackBar.open("Plese choose the deadline", "Ok", {
        duration: 3000,
      });
    }
  }

  displayFaculty(faculty) {
    this.faculty_projects = faculty["projects"];
  }

  startAllocation() {
    // this.userService.startAllocation().subscribe((data) => {});
  }

  sendEmails() {
    const dialogRef = this.dialog.open(DeletePopUpComponent, {
      width: "400px",
      height: "250px",
      data: {
        heading: "Confirm Sending Mails",
        message:
          "Are you sure you want to send the mails? This cannot be undone.",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result["message"] == "submit") {
        if (this.stage_no == 1) {
          this.userService.getStudentStreamEmails().subscribe((data1) => {
            if (data1["status"] == "success") {
              this.mailer
                .adminToStudents(
                  data1["result"],
                  this.curr_deadline,
                  data1["stream"]
                )
                .subscribe((data) => {

                  if (data["message"] == "success") {
                    let snackBarRef = this.snackBar.open(
                      "Mails have been sent",
                      "Ok",
                      {
                        duration: 3000,
                      }
                    );

                    snackBarRef.afterDismissed().subscribe(() => {
                      this.ngOnInit();
                    });
                    snackBarRef.onAction().subscribe(() => {
                      this.ngOnInit();
                    });
                  } else {
                    let snackBarRef = this.snackBar.open(
                      "Session Timed Out! Please Sign in Again!",
                      "Ok",
                      {
                        duration: 3000,
                      }
                    );
                    snackBarRef.afterDismissed().subscribe(() => {
                      this.loginService.signOut();
                    });
                    snackBarRef.onAction().subscribe(() => {
                      this.loginService.signOut();
                    });
                  }
                });
            }
          });
        } else {
          this.userService.getFacultyStreamEmails().subscribe((data1) => {
            if (data1["status"] == "success") {
              this.mailer
                .adminToFaculty(
                  this.stage_no,
                  data1["result"],
                  this.curr_deadline,
                  data1["stream"]
                )
                .subscribe((data2) => {
                  if (data2["message"] == "success") {
                    let snackBarRef = this.snackBar.open(
                      "Mails have been sent",
                      "Ok",
                      {
                        duration: 3000,
                      }
                    );
                    snackBarRef.afterDismissed().subscribe(() => {
                      this.ngOnInit();
                    });
                    snackBarRef.onAction().subscribe(() => {
                      this.ngOnInit();
                    });
                  } else {
                    let snackBarRef = this.snackBar.open(
                      "Session Timed Out! Please Sign in Again!",
                      "Ok",
                      {
                        duration: 3000,
                      }
                    );
                    snackBarRef.afterDismissed().subscribe(() => {
                      this.loginService.signOut();
                    });
                    snackBarRef.onAction().subscribe(() => {
                      this.loginService.signOut();
                    });
                  }
                });
            }
          });
        }
      }
    });
  }

  sendRemainder() {
    const dialogRef = this.dialog.open(DeletePopUpComponent, {
      width: "400px",
      height: "250px",
      data: {
        heading: "Confirm Sending Remainders",
        message:
          "Are you sure you want to send remainders? This cannot be undone.",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result["message"] == "submit") {
        if (this.stage_no == 1) {
          this.userService.getStudentStreamEmails().subscribe((data1) => {
            if (data1["status"] == "success") {
              this.mailer
                .adminToStudents(
                  data1["result"],
                  this.curr_deadline,
                  data1["stream"],
                  true
                )
                .subscribe((data) => {
                  // console.log(data);
                  if (data["status"] == "success") {
                    let snackBarRef = this.snackBar.open(
                      "Remainders have been sent",
                      "Ok",
                      {
                        duration: 3000,
                      }
                    );

                    snackBarRef.afterDismissed().subscribe(() => {
                      this.ngOnInit();
                    });
                    snackBarRef.onAction().subscribe(() => {
                      this.ngOnInit();
                    });
                  } else {
                    let snackBarRef = this.snackBar.open(
                      "Session Timed Out! Please Sign in Again!",
                      "Ok",
                      {
                        duration: 3000,
                      }
                    );
                    snackBarRef.afterDismissed().subscribe(() => {
                      this.loginService.signOut();
                    });
                    snackBarRef.onAction().subscribe(() => {
                      this.loginService.signOut();
                    });
                  }
                });
            }
          });
        } else {
          this.userService.getFacultyStreamEmails().subscribe((data1) => {
            // console.log(data1);
            if (data1["status"] == "success") {
              this.mailer
                .adminToFaculty(
                  this.stage_no,
                  data1["result"],
                  this.curr_deadline,
                  data1["stream"],
                  true
                )
                .subscribe((data2) => {
                  // console.log(data2);
                  if (data2["message"] == "success") {
                    let snackBarRef = this.snackBar.open(
                      "Remainders have been sent",
                      "Ok",
                      {
                        duration: 3000,
                      }
                    );
                    snackBarRef.afterDismissed().subscribe(() => {
                      this.ngOnInit();
                    });
                    snackBarRef.onAction().subscribe(() => {
                      this.ngOnInit();
                    });
                  } else {
                    let snackBarRef = this.snackBar.open(
                      "Session Timed Out! Please Sign in Again!",
                      "Ok",
                      {
                        duration: 3000,
                      }
                    );
                    snackBarRef.afterDismissed().subscribe(() => {
                      this.loginService.signOut();
                    });
                    snackBarRef.onAction().subscribe(() => {
                      this.loginService.signOut();
                    });
                  }
                });
            }
          });
        }
      }
    });
  }

  setProjectCap() {
    // console.log(this.fifthFormGroup.get("fifthCtrl").value);

    if (this.fifthFormGroup.controls["fifthCtrl"].value) {
      this.userService
        .setProjectCap(this.fifthFormGroup.get("fifthCtrl").value)
        .subscribe((data) => {
          // console.log(data);

          if (data["status"] == "success") {
            let snackBarRef = this.snackBar.open(data["msg"], "Ok", {
              duration: 3000,
            });
            this.ngOnInit(true);
          } else {
            let snackBarRef = this.snackBar.open(
              "Server Error! Please reload and try again!",
              "Ok",
              {
                duration: 3000,
              }
            );
          }
        });
    } else {
      let snackBarRef = this.snackBar.open("Please enter a number", "Ok", {
        duration: 3000,
      });
    }
  }
}
