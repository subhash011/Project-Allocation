import { MailService } from "./../../../services/mailing/mail.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeletePopUpComponent } from "./../delete-pop-up/delete-pop-up.component";
import { MatDialog } from "@angular/material/dialog";
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { UserService } from "src/app/services/user/user.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatStepper } from "@angular/material";
import { Router } from "@angular/router";
import { Location } from "@angular/common";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"]
})
export class AdminComponent implements OnInit {
  public details; // For displaying the projects tab
  public faculty_projects;

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;

  public stage_no;
  dateSet = [];
  curr_deadline;

  //Progress Bar
  progress_value = 0;
  startDate;
  minDate;
  //Buttons
  proceedButton1 = true;
  proceedButton2 = true;
  proceedButton3 = true;

  //Input
  input1;
  input2;
  input3;

  days_left;

  @ViewChild("stepper", { static: false }) stepper: MatStepper;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private mailer: MailService,
    private location: Location,
    private router: Router
  ) {
    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: [this.dateSet[0]]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: [this.dateSet[1]]
    });
    this.thirdFormGroup = this.formBuilder.group({
      thirdCtrl: [this.dateSet[2]]
    });
    this.fourthFormGroup = this.formBuilder.group({
      fourthCtrl: [this.dateSet[3]]
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      for (let step = 0; step < this.stage_no; step++) {
        this.stepper.next();
      }
    });
  }

  ngOnInit() {
    this.userService.getAdminInfo().subscribe(data => {
      console.log(data);
      this.stage_no = data["stage"];

      this.dateSet = data["deadlines"];
      // this.curr_deadline = this.dateSet[this.dateSet.length - 1];
      this.dateSet = this.dateSet.map(date => {
        return new Date(date);
      });
      this.startDate = data["startDate"];
      this.ngAfterViewInit();
      if (this.dateSet.length == 1) {
        this.input1 = true;
        this.firstFormGroup.controls["firstCtrl"].disable({ onlySelf: true });
      }
      if (this.dateSet.length == 2) {
        this.input2 = true;
        this.firstFormGroup.controls["secondCtrl"].disable({ onlySelf: true });
      }
      if (this.dateSet.length == 3) {
        this.input3 = true;
        this.firstFormGroup.controls["thirdCtrl"].disable({ onlySelf: true });
      }

      if (this.stage_no == 0) {
        this.minDate = new Date();
      } else {
        this.minDate = this.dateSet[this.dateSet.length - 1];
      }

      if (this.firstFormGroup.controls["firstCtrl"])
        this.firstFormGroup.controls["firstCtrl"].setValue(this.dateSet[0]);
      if (this.firstFormGroup.controls["secondCtrl"])
        this.secondFormGroup.controls["secondCtrl"].setValue(this.dateSet[1]);
      if (this.firstFormGroup.controls["secondCtrl"])
        this.thirdFormGroup.controls["secondCtrl"].setValue(this.dateSet[2]);
    });

    this.userService.Admin_getStreamDetails().subscribe(data => {
      console.log(data);
      this.details = data["project_details"];

      this.curr_deadline = this.dateSet[this.dateSet.length - 1];
      console.log(this.curr_deadline);
      if (this.dateSet.length != 0) {
        let today = new Date();

        this.days_left = this.daysBetween(today, this.curr_deadline);
        console.log(this.days_left);

        if (this.days_left <= 0) {
          this.proceedButton1 = false;
          this.proceedButton2 = false;
          this.proceedButton3 = false;
        }
      }
    });
  }

  proceed() {
    this.stage_no++;

    this.userService.updateStage(this.stage_no).subscribe(data => {
      console.log(data);
    });

    this.progress_value = 0;
    this.days_left = "Please Set the deadline";
    this.proceedButton1 = true;
    this.proceedButton2 = true;
    this.proceedButton3 = true;
  }

  daysBetween(date1, date2) {
    //Get 1 day in milliseconds
    var one_day = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;

    // if (difference_ms < 0) {
    //   return 0;
    // }

    // Convert back to days and return
    return Math.abs(difference_ms) / one_day;
  }

  setDeadline() {
    // console.log(formGroup.get('firstCtrl').value)
    //Backend Call for setting the deadline only on confirmation
    // console.log(this.stage_no)
    this.curr_deadline = this.dateSet[this.dateSet.length - 1];

    if (this.stage_no == 0) {
      var date = this.firstFormGroup.get("firstCtrl").value;
    } else if (this.stage_no == 1) {
      // console.log('yes')
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
          message:
            "Are you sure you want to fix the deadline? On confirmation emails will be sent."
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result["message"] == "submit") {
          // console.log(date)
          this.userService.setDeadline(date).subscribe(data => {
            if (data["status"] == "success") {
              if (this.stage_no == 1) {
                this.userService.getStudentStreamEmails().subscribe(data1 => {
                  console.log(data1);
                  if (data1["status"] == "success") {
                    this.mailer
                      .adminToStudents(
                        data1["result"],
                        this.curr_deadline,
                        data1["stream"]
                      )
                      .subscribe(data => {
                        console.log(data);

                        let snackBarRef = this.snackBar.open(
                          "Mails have been sent",
                          "Ok",
                          {
                            duration: 3000
                          }
                        );
                        snackBarRef.afterDismissed().subscribe(() => {
                          this.ngOnInit();
                        });
                        snackBarRef.onAction().subscribe(() => {
                          this.ngOnInit();
                        });
                      });
                  }
                });
              } else {
                this.userService.getFacultyStreamEmails().subscribe(data1 => {
                  if (data1["status"] == "success") {
                    console.log(data);
                    this.mailer
                      .adminToFaculty(
                        this.stage_no,
                        data1["result"],
                        this.curr_deadline,
                        data1["stream"]
                      )
                      .subscribe(data2 => {
                        console.log(data2);

                        let snackBarRef = this.snackBar.open(
                          "Mails have been sent",
                          "Ok",
                          {
                            duration: 3000
                          }
                        );
                        snackBarRef.afterDismissed().subscribe(() => {
                          this.ngOnInit();
                        });
                        snackBarRef.onAction().subscribe(() => {
                          this.ngOnInit();
                        });
                      });
                  }
                });
              }
            }
          });

          // console.log("submitted");
        }
      });
    } else {
      //Snack bar
      let snackBarRef = this.snackBar.open("Plese choose the deadline", "Ok", {
        duration: 3000
      });
    }
  }

  displayFaculty(faculty) {
    // console.log(faculty)
    this.faculty_projects = faculty["projects"];
  }

  startAllocation() {}
}
