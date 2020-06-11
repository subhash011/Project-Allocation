import { ExporttocsvService } from "./../../../services/exporttocsv/exporttocsv.service";
import { ActivatedRoute } from "@angular/router";
import { ProjectsService } from "./../../../services/projects/projects.service";
import { LoginComponent } from "./../../shared/login/login.component";
import { MailService } from "./../../../services/mailing/mail.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeletePopUpComponent } from "./../delete-pop-up/delete-pop-up.component";
import { MatDialog } from "@angular/material/dialog";
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { UserService } from "src/app/services/user/user.service";
import {
  Component,
  OnInit,
  ViewChild,
  RootRenderer,
  OnDestroy,
  Pipe,
  PipeTransform,
  HostListener,
} from "@angular/core";
import { MatStepper, MatTableDataSource } from "@angular/material";
import { MatSort, Sort } from "@angular/material/sort";
import { LoadingBarService } from "@ngx-loading-bar/core";
import { SelectionModel } from "@angular/cdk/collections";
import { ResetComponent } from "../reset/reset.component";
import { LoaderComponent } from "../../shared/loader/loader.component";
import { ShowPreferencesComponent } from "../../student-components/show-preferences/show-preferences.component";
import { ShowStudentPreferencesComponent } from "../show-student-preferences/show-student-preferences.component";
import { ShowFacultyPreferencesComponent } from "../show-faculty-preferences/show-faculty-preferences.component";
import { saveAs } from "file-saver";
import * as moment from "moment";
import { NavbarComponent } from "../../shared/navbar/navbar.component";


@Pipe({
  name:"getViolations"
})
export class GetViolations implements PipeTransform {
  transform(stCap,prCap,stPerFac, tooltip?:boolean) {
    let violations = [];
    let flag = true;
    if(stCap) {
      flag = false;
      violations.push("SPP");
    }
    if(prCap) {
      flag = false;
      violations.push("PFE")
    }
    if(stPerFac) {
      flag = false;
      violations.push("SPF");
    }
    if(flag && !tooltip) {
      return "None"
    }
    if(tooltip && violations.length != 0) {
      return "Some faculty has a violation, head to the manage tab to check the violations."
    }
    return violations.join(", ");
  }
}

@Pipe({
  name: "selectedLength",
})
export class SelectedLength implements PipeTransform {
  transform(selected, filteredData) {
    console.log(selected);
    selected = selected.map((val) => val._id);
    filteredData = filteredData.map((val) => val._id);
    let count = 0;
    selected.forEach((project) => {
      count += filteredData.indexOf(project) != -1 ? 1 : 0;
    });
    return count;
  }
}

@Pipe({
  name: "getAllotedStudents",
})
export class AllotedStudents implements PipeTransform {
  transform(alloted) {
    var ans = "";
    for (const allot of alloted) {
      ans += allot.name + ", ";
    }
    ans = ans.substring(0, ans.length - 2);
    return ans;
  }
}

@Pipe({
  name: "getIncludedOfTotal",
})
export class GetIncludedOfTotal implements PipeTransform {
  transform(faculties) {
    let included = 0;
    let total = 0;
    faculties.forEach((faculty) => {
      included += faculty.includedProjectsCount;
      total += faculty.noOfProjects;
      return;
    });
    return included + " / " + total;
  }
}
@Pipe({
  name: "getStudentIntake",
})
export class StudentIntake implements PipeTransform {
  transform(projects) {
    let sum = 0;
    for (let project of projects) {
      sum += project.studentIntake;
    }
    return sum;
  }
}

@Pipe({
  name: "getActiveProjects",
})
export class ActiveProjects implements PipeTransform {
  transform(projects) {
    let sum = 0;
    projects.forEach((project) => {
      if (project.isIncluded) sum++;
    });
    return sum;
  }
}

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
  providers: [LoginComponent],
})
export class AdminComponent implements OnInit, OnDestroy {
  public details; // For displaying the projects tab
  public faculty_projects;
  public fileToUpload: File = null;
  projectTableHeight: number = window.innerHeight * 0.6;
  studentTableHeight: number = window.innerHeight * 0.6;
  columns: string[] = [
    "select",
    "Title",
    "studentIntake",
    "Faculty",
    "Duration",
    "Preferences",
    "NoOfStudents",
    "isIncluded",
    "Student",
  ];
  facultyCols = [
    "Name",
    "NoOfProjects",
    "StudentIntake",
    "Email",
    "Actions",
    "Violations",
  ];
  studentCols = ["Name", "Email", "GPA", "Registered", "ViewPref", "Actions"];

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;
  fifthFormGroup: FormGroup;
  sixthFormGroup: FormGroup;
  seventhFormGroup: FormGroup;

  public programName;
  position = "above";

  public stage_no;
  dateSet = [];
  curr_deadline;
  startDate;
  minDate;
  isActive: boolean = false;
  indexHover: number = -1;
  projects: any = [];
  background = "primary";
  //Buttons
  proceedButton1 = true;
  proceedButton2 = true;
  proceedButton3 = true;

  proceedButton1_ = true;
  proceedButton2_ = true;
  proceedButton3_ = true;

  publishStudents = true;
  publishFaculty = true;

  index;
  faculties: any = new MatTableDataSource([]);
  students: any = new MatTableDataSource([]);
  student;
  faculty;

  studentsPerFaculty;
  projectCap;
  studentCap;
  studentCount = 0;
  availableProjects = 0;
  days_left;
  project: any;

  dataSource: any = new MatTableDataSource([]);
  selection = new SelectionModel(true, []);

  @ViewChild("stepper", { static: false }) stepper: MatStepper;
  timer;
  currentTime: Date = new Date();

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private mailer: MailService,
    private projectService: ProjectsService,
    private loginService: LoginComponent,
    private loadingBar: LoadingBarService,
    private exportService: ExporttocsvService,
    private navbar: NavbarComponent
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
    this.sixthFormGroup = this.formBuilder.group({
      sixthCtrl: [this.studentCap],
    });
    this.seventhFormGroup = this.formBuilder.group({
      seventhCtrl: [this.studentsPerFaculty],
    });
  }
  @HostListener("window:resize", ["$event"])
  onResize(event) {
    if (event.target.innerHeight <= 1400) {
      this.projectTableHeight = event.target.innerHeight * 0.6;
      this.studentTableHeight = event.target.innerHeight * 0.6;
    } else {
      this.projectTableHeight = event.target.innerHeight * 0.6;
      this.studentTableHeight = event.target.innerHeight * 0.6;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.stage_no == 1) {
        if (this.stepper.selectedIndex == 0) {
          this.stepper.next();
        }
      }
      if (this.stage_no == 2) {
        if (this.stepper.selectedIndex == 0) {
          this.stepper.next();
          this.stepper.next();
        }
      }

      if (this.stage_no >= 3) {
        if (this.stepper.selectedIndex == 0) {
          this.stepper.next();
          this.stepper.next();
          this.stepper.next();
        }
      }
    });
  }

  ngOnInit() {
    var dialogRefLoad = this.dialog.open(LoaderComponent, {
      data: "Please wait ...",
      disableClose: true,
      hasBackdrop: true,
    });

    this.timer = setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
    if (!localStorage.getItem("pf")) {
      localStorage.setItem("pf", "true");
    }
    if (!localStorage.getItem("ps")) {
      localStorage.setItem("ps", "true");
    }
    this.publishFaculty = localStorage.getItem("pf") == "true" ? true : false;
    this.publishStudents = localStorage.getItem("ps") == "true" ? true : false;
    this.userService.getAdminInfo().subscribe(
      (data) => {
        if (data["status"] == "success") {
          this.programName = data["stream"];
          this.stage_no = data["stage"];
          this.dateSet = data["deadlines"];
          this.projectCap = data["projectCap"];
          this.studentCap = data["studentCap"];
          this.studentsPerFaculty = data["studentsPerFaculty"];
          this.dateSet = this.dateSet.map((date) => {
            return new Date(date);
          });
          this.startDate = data["startDate"];
          this.ngAfterViewInit();
          this.curr_deadline = this.dateSet[this.dateSet.length - 1];
          this.firstFormGroup.controls["firstCtrl"].setValue(this.dateSet[0]);
          this.secondFormGroup.controls["secondCtrl"].setValue(this.dateSet[1]);
          this.thirdFormGroup.controls["thirdCtrl"].setValue(this.dateSet[2]);
          this.fifthFormGroup.controls["fifthCtrl"].setValue(this.projectCap);
          this.sixthFormGroup.controls["sixthCtrl"].setValue(this.studentCap);
          this.seventhFormGroup.controls["seventhCtrl"].setValue(
            this.studentsPerFaculty
          );

          this.userService.getMembersForAdmin().subscribe(
            (result) => {
              dialogRefLoad.close();
              if (result["message"] == "success") {
                this.faculties.data = result["result"]["faculties"];
                this.students.data = result["result"]["students"];
                this.sortStudents({ direction: "asc", active: "Email" });
                this.studentCount = result["result"]["students"].length;
                this.faculties.filterPredicate = (data: any, filter: string) =>
                  !filter ||
                  data.name.toLowerCase().includes(filter) ||
                  data.email.toLowerCase().includes(filter);
                this.students.filterPredicate = (data: any, filter: string) =>
                  !filter ||
                  data.name.toLowerCase().includes(filter) ||
                  data.email.toLowerCase().includes(filter);
                let flag = false;
                for (const faculty of this.faculties.data) {
                  if (
                    faculty.project_cap ||
                    faculty.student_cap ||
                    faculty.studentsPerFaculty
                  ) {
                    this.proceedButton1_ = true;
                    this.proceedButton2_ = true;
                    this.proceedButton3_ = true;
                    flag = true;
                    break;
                  }
                }

                this.getAllocationValidation(flag);
              } else {
                this.navbar.role = "none";
                this.snackBar.open(
                  "Session Timed Out! Please Sign-In again",
                  "Ok",
                  {
                    duration: 3000,
                  }
                );
                this.loginService.signOut();
              }
            },
            () => {
              dialogRefLoad.close();
              this.snackBar.open("Some Error Occured! Try again later.", "OK", {
                duration: 3000,
              });
            }
          );
        } else {
          dialogRefLoad.close();
          this.navbar.role = "none";
          this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
            duration: 3000,
          });
          this.loginService.signOut();
        }
      },
      () => {
        dialogRefLoad.close();
        this.navbar.role = "none";
        this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
          duration: 3000,
        });
        this.loginService.signOut();
      }
    );

    this.projectService.getAllStreamProjects().subscribe(
      (projects) => {
        if (projects["message"] == "success") {
          this.projects = projects["result"];
          this.dataSource.data = this.projects;
          this.dataSource.filterPredicate = (data: any, filter: string) =>
            !filter ||
            data.faculty.toLowerCase().includes(filter) ||
            data.title.toLowerCase().includes(filter) ||
            data.description.toLowerCase().includes(filter);
          this.selectIncluded();
        } else {
          dialogRefLoad.close();
          this.navbar.role = "none";
          this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
            duration: 3000,
          });
          this.loginService.signOut();
        }
      },
      () => {
        dialogRefLoad.close();
        this.navbar.role = "none";
        this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
          duration: 3000,
        });
        this.loginService.signOut();
      }
    );
  }
  getTooltipInculsion(project) {
    return project.isIncluded
      ? null
      : "This faculty has excluded the project. Contact the faculty if needed.";
  }

  proceed() {
    const dialogRef = this.dialog.open(DeletePopUpComponent, {
      width: "400px",
      height: "250px",
      data: {
        heading: "Confirm Proceed",
        message:
          "Please ensure that mails have been sent. Are you sure you want to proceed to the next stage?",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result["message"] == "submit") {
        var dialogRefLoad = this.dialog.open(LoaderComponent, {
          data: "Please wait ...",
          disableClose: true,
          hasBackdrop: true,
        });

        this.stage_no++;
        this.stepper.next();
        this.proceedButton1 = true;
        this.proceedButton2 = true;
        this.proceedButton3 = true;
        this.userService.updateStage(this.stage_no).subscribe(
          (data) => {
            if (data["status"] == "success") {
              let snackBarRef = this.snackBar.open(
                "Successfully moved to the next stage!",
                "Ok",
                {
                  duration: 10000,
                }
              );

              snackBarRef.afterDismissed().subscribe(() => {
                if (this.stage_no >= 3) {
                  this.snackBar.open(
                    "Please go to the project tab to start the allocation",
                    "Ok",
                    {
                      duration: 10000,
                    }
                  );
                }
              });
              if (this.stage_no >= 3) {
                this.exportService.generateCSV_projects().subscribe((data) => {
                  dialogRefLoad.close();
                  if (data["message"] == "success") {
                    this.exportService
                      .generateCSV_students()
                      .subscribe((data) => {
                        if (data["message"] == "success") {
                        }
                      });
                  }
                });
              }
              dialogRefLoad.close();
            } else {
              dialogRefLoad.close();
              this.navbar.role = "none";
              this.snackBar.open(
                "Session Timed Out! Please Sign-In again",
                "Ok",
                {
                  duration: 3000,
                }
              );
              this.loginService.signOut();
            }
          },
          () => {
            dialogRefLoad.close();
            this.navbar.role = "none";
            this.snackBar.open(
              "Session Timed Out! Please Sign-In again",
              "Ok",
              {
                duration: 3000,
              }
            );
            this.loginService.signOut();
          }
        );
      }
    });
  }

  discardAllocation() {
    localStorage.removeItem("allocationMap");
  }

  removeFaculty(id) {
    let dialogRef = this.dialog.open(DeletePopUpComponent, {
      height: "200px",
      width: "300px",
      data: {
        heading: "Confirm Deletion",
        message: "Are you sure you want to remove the Faculty?",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result["message"] == "submit") {
        var dialogRefLoad = this.dialog.open(LoaderComponent, {
          data: "Please wait ...",
          disableClose: true,
          hasBackdrop: true,
        });

        this.userService.removeFacultyAdmin(id).subscribe(
          (result) => {
            dialogRefLoad.close();
            if (result["message"] == "success") {
              this.snackBar.open("Removed Faculty", "Ok", {
                duration: 3000,
              });
              this.faculties.data = this.faculties.data.filter((val) => {
                return val._id != id;
              });
              this.dataSource.data = this.dataSource.data.filter((val) => {
                return val.faculty_id != id;
              });
            } else {
              this.navbar.role = "none";
              this.snackBar.open(
                "Session Timed Out! Please Sign-In again",
                "Ok",
                {
                  duration: 3000,
                }
              );
              this.loginService.signOut();
            }
          },
          () => {
            dialogRefLoad.close();
            this.navbar.role = "none";
            this.snackBar.open(
              "Session Timed Out! Please Sign-In again",
              "Ok",
              {
                duration: 3000,
              }
            );
            this.loginService.signOut();
          }
        );
      }
    });
  }
  removeStudent(student) {
    const id = student._id;
    let dialogRef = this.dialog.open(DeletePopUpComponent, {
      height: "200px",
      width: "300px",
      data: {
        heading: "Confirm Deletion",
        message: "Are you sure you want to remove the Student?",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result["message"] == "submit") {
        var dialogRefLoad = this.dialog.open(LoaderComponent, {
          data: "Please wait ...",
          disableClose: true,
          hasBackdrop: true,
        });

        this.userService.removeStudentAdmin(id).subscribe(
          (result) => {
            dialogRefLoad.close();
            if (result["message"] == "success") {
              this.studentCount--;
              this.snackBar.open("Removed Student", "Ok", {
                duration: 3000,
              });
              this.students.data = this.students.data.filter((val) => {
                return val._id != id;
              });
              this.dataSource.data.forEach((project) => {
                project.students_id = project.students_id.filter((val) => {
                  return val.roll_no != student.email.split("@")[0];
                });
              });
              this.dataSource.data = [...this.dataSource.data];
            } else {
              this.navbar.role = "none";
              this.snackBar.open(
                "Session Timed Out! Please Sign-In again",
                "Ok",
                {
                  duration: 3000,
                }
              );
              this.loginService.signOut();
            }
          },
          () => {
            dialogRefLoad.close();
            this.navbar.role = "none";
            this.snackBar.open(
              "Session Timed Out! Please Sign-In again",
              "Ok",
              {
                duration: 3000,
              }
            );
            this.loginService.signOut();
          }
        );
      }
    });
  }

  daysBetween(date1, date2) {
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
        height: "200px",
        data: {
          heading: "Confirm Deadline",
          message: "Are you sure you want to fix the deadline?",
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result["message"] == "submit") {
          var dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Please wait ...",
            disableClose: true,
            hasBackdrop: true,
          });

          date = moment(new Date(date)).format();
          this.userService.setDeadline(date).subscribe(
            (data) => {
              dialogRefLoad.close();
              if (data["status"] == "success") {
                this.snackBar.open("Deadline set successfully!!", "Ok", {
                  duration: 3000,
                });
                this.ngOnInit();
              } else {
                this.navbar.role = "none";
                this.snackBar.open(
                  "Session Timed Out! Please Sign-In again",
                  "Ok",
                  {
                    duration: 3000,
                  }
                );
                this.loginService.signOut();
              }
            },
            () => {
              dialogRefLoad.close();
              this.navbar.role = "none";
              this.snackBar.open(
                "Session Timed Out! Please Sign-In again",
                "Ok",
                {
                  duration: 3000,
                }
              );
              this.loginService.signOut();
            }
          );
        }
      });
    } else {
      this.snackBar.open("Plese choose the deadline", "Ok", {
        duration: 3000,
      });
    }
  }

  displayFaculty(faculty) {
    this.faculty_projects = faculty["projects"];
  }

  startAllocation() {
    var selectedProjects = this.selection.selected;
    var dialogRef = this.dialog.open(LoaderComponent, {
      data: "Allocating projects, Please wait as this may take a while",
      disableClose: true,
      hasBackdrop: true,
    });
    const length = this.students.data.filter((val) => val.isRegistered).length;
    this.userService.validateAllocation(selectedProjects, length).subscribe(
      (data) => {
        if (data["status"] == "success") {
          this.projectService.startAllocation(selectedProjects).subscribe(
            (data) => {
              dialogRef.close();
              if (data["message"] == "success") {
                selectedProjects = selectedProjects.map((val) =>
                  String(val._id)
                );
                this.dataSource = new MatTableDataSource(data["result"]);
                this.selection.clear();
                this.dataSource.data.forEach((row) => {
                  if (selectedProjects.indexOf(row._id.toString()) != -1) {
                    this.selection.select(row);
                  }
                });

                localStorage.setItem(
                  "allocationMap",
                  JSON.stringify(data["allocationMap"])
                );
                this.userService.updatePublish("reset").subscribe((data) => {
                  if (data["status"] == "success") {
                    this.publishStudents = false;
                    this.publishFaculty = false;
                    localStorage.setItem("ps", "false");
                    localStorage.setItem("pf", "false");
                    if (this.stage_no == 3) {
                      this.userService
                        .updateStage(this.stage_no + 1)
                        .subscribe((data) => {
                          if (data["status"] == "success") {
                            this.snackBar.open(
                              "Allocation completed successfully",
                              "Ok",
                              {
                                duration: 3000,
                              }
                            );
                          } else {
                            this.navbar.role = "none";
                            this.snackBar.open(
                              "Session Timed Out! Please Sign-In again",
                              "Ok",
                              {
                                duration: 3000,
                              }
                            );
                            this.loginService.signOut();
                          }
                        });
                    } else {
                      this.snackBar.open(
                        "Allocation completed successfully",
                        "Ok",
                        {
                          duration: 3000,
                        }
                      );
                    }
                  }
                });
              } else if (data["message"] == "invalid-token") {
                this.navbar.role = "none";
                this.snackBar.open(
                  "Session Expired! Sign-In and try again",
                  "Ok",
                  {
                    duration: 3000,
                  }
                );
                this.loginService.signOut();
              } else {
                this.snackBar.open("Some error occured! Try again", "Ok", {
                  duration: 3000,
                });
              }
            },
            () => {
              dialogRef.close();
              this.navbar.role = "none";
              this.snackBar.open(
                "Session Timed Out! Please Sign-In again",
                "Ok",
                {
                  duration: 3000,
                }
              );
              this.loginService.signOut();
            }
          );
        } else {
          dialogRef.close();
          this.snackBar.open(
            "Unable to do an allocation. Please note the number of projects that can be alloted must be greater than or equal to the number of students.",
            "Ok",
            {
              duration: 10000,
            }
          );
        }
      },
      () => {
        dialogRef.close();
        this.navbar.role = "none";
        this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
          duration: 3000,
        });
        this.loginService.signOut();
      }
    );
  }

  sendEmails() {
    const dialogRef = this.dialog.open(DeletePopUpComponent, {
      width: "400px",
      height: "200px",
      disableClose: false,
      hasBackdrop: true,
      data: {
        heading: "Confirm Sending Mails",
        message:
          "Are you sure you want to send the mails? This cannot be undone.",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result["message"] == "submit") {
        var dialogRefLoad = this.dialog.open(LoaderComponent, {
          data: "Sending mails, Please wait as this may take a while",
          disableClose: true,
          hasBackdrop: true,
        });
        if (this.stage_no == 0 || this.stage_no == 2) {
          this.userService.getFacultyStreamEmails().subscribe(
            (data1) => {
              if (data1["status"] == "success") {
                this.mailer
                  .adminToFaculty(
                    this.stage_no,
                    data1["result"],
                    this.curr_deadline,
                    data1["streamFull"]
                  )
                  .subscribe((data2) => {
                    dialogRefLoad.close();
                    if (data2["message"] == "success") {
                      this.snackBar.open("Mails have been sent", "Ok", {
                        duration: 3000,
                      });
                    } else {
                      this.navbar.role = "none";
                      this.snackBar.open(
                        "Session Timed Out! Please Sign-In again",
                        "Ok",
                        {
                          duration: 3000,
                        }
                      );
                      this.loginService.signOut();
                    }
                  });
              } else {
                dialogRefLoad.close();
              }
            },
            () => {
              dialogRefLoad.close();
              this.navbar.role = "none";
              this.snackBar.open(
                "Session Timed Out! Please Sign-In again",
                "Ok",
                {
                  duration: 3000,
                }
              );
              this.loginService.signOut();
            }
          );
        } else if (this.stage_no == 1) {
          this.userService.getStudentStreamEmails().subscribe(
            (data1) => {
              if (data1["status"] == "success") {
                this.mailer
                  .adminToStudents(
                    data1["result"],
                    this.curr_deadline,
                    data1["streamFull"]
                  )
                  .subscribe((data) => {
                    dialogRefLoad.close();
                    if (data["message"] == "success") {
                      this.snackBar.open("Mails have been sent", "Ok", {
                        duration: 3000,
                      });
                    } else {
                      this.navbar.role = "none";
                      dialogRefLoad.close();
                      this.snackBar.open(
                        "Session Timed Out! Please Sign-In again",
                        "Ok",
                        {
                          duration: 3000,
                        }
                      );
                      this.loginService.signOut();
                    }
                  });
              }
            },
            () => {
              dialogRefLoad.close();
              this.navbar.role = "none";
              this.snackBar.open(
                "Session Timed Out! Please Sign-In again",
                "Ok",
                {
                  duration: 3000,
                }
              );
              this.loginService.signOut();
            }
          );
        } else {
          this.userService.fetchAllMails().subscribe(
            (result) => {
              if (result["message"] == "success") {
                this.mailer
                  .allocateMail(result["result"], result["streamFull"])
                  .subscribe((result) => {
                    dialogRefLoad.close();
                    if (result["message"] == "success") {
                      this.loadingBar.stop();
                      this.snackBar.open(
                        "Mails have been sent successfully.",
                        "Ok",
                        {
                          duration: 3000,
                        }
                      );
                    } else {
                      dialogRefLoad.close();
                      this.loadingBar.stop();
                      this.snackBar.open(
                        "Mails not sent! Please try again.",
                        "Ok",
                        {
                          duration: 3000,
                        }
                      );
                    }
                  });
              } else {
                dialogRefLoad.close();
                this.loadingBar.stop();
                this.snackBar.open(
                  "Unable to fetch mails! If the error persists re-authenticate.",
                  "Ok",
                  {
                    duration: 10000,
                  }
                );
              }
            },
            () => {
              dialogRefLoad.close();
              this.navbar.role = "none";
              this.snackBar.open(
                "Session Timed Out! Please Sign-In again",
                "Ok",
                {
                  duration: 3000,
                }
              );
              this.loginService.signOut();
            }
          );
        }
      }
    });
  }

  setProjectCap() {
    if (this.fifthFormGroup.controls["fifthCtrl"].value > 0) {
      var dialogRefLoad = this.dialog.open(LoaderComponent, {
        data: "Please wait ...",
        disableClose: true,
        hasBackdrop: true,
      });

      this.userService
        .setProjectCap(this.fifthFormGroup.get("fifthCtrl").value)
        .subscribe(
          (data) => {
            dialogRefLoad.close();
            if (data["status"] == "success") {
              this.snackBar.open(data["msg"], "Ok", {
                duration: 3000,
              });
              this.validateFields();
            } else {
              this.navbar.role = "none";
              this.snackBar.open(
                "Session Timed Out! Please Sign-In again",
                "Ok",
                {
                  duration: 3000,
                }
              );
              this.loginService.signOut();
            }
          },
          () => {
            dialogRefLoad.close();
            this.navbar.role = "none";
            this.snackBar.open(
              "Session Timed Out! Please Sign-In again",
              "Ok",
              {
                duration: 3000,
              }
            );
            this.loginService.signOut();
          }
        );
    } else {
      dialogRefLoad.close();
      this.snackBar.open("Please enter a valid number", "Ok", {
        duration: 3000,
      });
    }
  }

  setStudentCap() {
    if (this.sixthFormGroup.controls["sixthCtrl"].value > 0) {
      var dialogRefLoad = this.dialog.open(LoaderComponent, {
        data: "Please wait ...",
        disableClose: true,
        hasBackdrop: true,
      });
      this.userService
        .setStudentCap(this.sixthFormGroup.get("sixthCtrl").value)
        .subscribe(
          (data) => {
            dialogRefLoad.close();
            if (data["status"] == "success") {
              this.snackBar.open(data["msg"], "Ok", {
                duration: 3000,
              });
              this.validateFields();
            } else {
              this.navbar.role = "none";
              this.snackBar.open(
                "Session Timed Out! Please Sign-In again",
                "Ok",
                {
                  duration: 3000,
                }
              );
              this.loginService.signOut();
            }
          },
          () => {
            dialogRefLoad.close();
            this.navbar.role = "none";
            this.snackBar.open(
              "Session Timed Out! Please Sign-In again",
              "Ok",
              {
                duration: 3000,
              }
            );
            this.loginService.signOut();
          }
        );
    } else {
      dialogRefLoad.close();
      this.snackBar.open("Please enter a valid number", "Ok", {
        duration: 3000,
      });
    }
  }

  setStudentsPerFaculty() {
    if (this.seventhFormGroup.controls["seventhCtrl"].value > 0) {
      var dialogRefLoad = this.dialog.open(LoaderComponent, {
        data: "Please wait ...",
        disableClose: true,
        hasBackdrop: true,
      });
      this.userService
        .setStudentsPerFaculty(this.seventhFormGroup.get("seventhCtrl").value)
        .subscribe(
          (data) => {
            dialogRefLoad.close();
            if (data["status"] == "success") {
              this.snackBar.open(data["msg"], "Ok", {
                duration: 3000,
              });
              this.validateFields();
            } else {
              this.navbar.role = "none";
              this.snackBar.open(
                "Session Timed Out! Please Sign-In again",
                "Ok",
                {
                  duration: 3000,
                }
              );
              this.loginService.signOut();
            }
          },
          () => {
            dialogRefLoad.close();
            this.navbar.role = "none";
            this.snackBar.open(
              "Session Timed Out! Please Sign-In again",
              "Ok",
              {
                duration: 3000,
              }
            );
            this.loginService.signOut();
          }
        );
    } else {
      dialogRefLoad.close();
      this.snackBar.open("Please enter a valid number", "Ok", {
        duration: 3000,
      });
    }
  }

  validateFields() {
    this.userService.getMembersForAdmin().subscribe(
      (result) => {
        if (result["message"] == "success") {
          this.faculties.data = result["result"]["faculties"];
          this.students.data = result["result"]["students"];
          let flag = false;
          for (const faculty of this.faculties.data) {
            if (
              faculty.project_cap ||
              faculty.student_cap ||
              faculty.studentsPerFaculty
            ) {
              this.proceedButton1_ = true;
              this.proceedButton2_ = true;
              this.proceedButton3_ = true;
              flag = true;
              break;
            }
          }
          this.getAllocationValidation(flag);
        } else {
          this.navbar.role = "none";
          this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
            duration: 3000,
          });
          this.loginService.signOut();
        }
      },
      () => {
        this.navbar.role = "none";
        this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
          duration: 3000,
        });
        this.loginService.signOut();
      }
    );
  }

  getAllocationValidation(flag) {
    const length = this.students.data.filter((val) => val.isRegistered).length;

    this.userService
      .validateAllocation(this.selection.selected, length)
      .subscribe(
        (data) => {
          if (data["status"] == "success") {
            if (this.dateSet.length == 1) {
              if (this.firstFormGroup.controls["firstCtrl"]) {
                this.proceedButton1 = false;
                if (!flag) this.proceedButton1_ = false;
              }
            }
          } else {
            if (this.dateSet.length == 1) {
              if (this.firstFormGroup.controls["firstCtrl"]) {
                this.proceedButton1 = false;
                this.proceedButton1_ = true;
              }
            }
          }

          if (this.dateSet.length == 2) {
            if (this.secondFormGroup.controls["secondCtrl"]) {
              this.proceedButton2 = false;
              if (!flag) this.proceedButton2_ = false;
            }
          }
          if (this.dateSet.length == 3) {
            if (this.thirdFormGroup.controls["thirdCtrl"])
              this.proceedButton3 = false;
            if (!flag) this.proceedButton3_ = false;
          }
          this.minDate = new Date();
        },
        () => {
          this.navbar.role = "none";
          this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
            duration: 3000,
          });
          this.loginService.signOut();
        }
      );
  }

  isAllSelected() {
    const numSelected = this.selection.selected
      ? this.selection.selected.length
      : 0;
    var numRows = 0;
    if (this.dataSource.data) {
      this.dataSource.data.forEach((row) => {
        numRows += row.isIncluded ? 1 : 0;
      });
    }
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.selectIncluded();
  }

  selectIncluded() {
    this.selection.clear();
    this.dataSource.data.forEach((row) => {
      row.isIncluded
        ? this.selection.select(row)
        : this.selection.deselect(row);
    });
  }

  selectAll() {
    this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selection.isSelected(row) ? "deselect" : "select"} row ${
      row.position + 1
    }`;
  }

  stepDownStage() {
    const dialogRef = this.dialog.open(DeletePopUpComponent, {
      width: "400px",
      height: "250px",
      data: {
        heading: "Confirm Proceed",
        message: "Are you sure you want to revert back to the previous stage?",
      },
    });

    const currStage = this.stage_no;

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result["message"] == "submit") {
        var dialogRefLoad = this.dialog.open(LoaderComponent, {
          data: "Please wait ...",
          disableClose: true,
          hasBackdrop: true,
        });
        this.userService.revertStage(currStage).subscribe(
          (data) => {
            localStorage.setItem("pf", "false");
            localStorage.setItem("ps", "false");
            dialogRefLoad.close();
            if ((data["status"] = "success")) {
              this.snackBar.open(data["msg"], "Ok", {
                duration: 3000,
              });
              this.proceedButton1_ = true;
              this.proceedButton2_ = true;
              this.proceedButton3_ = true;

              this.proceedButton1 = true;
              this.proceedButton2 = true;
              this.proceedButton3 = true;

              this.stepper.previous();
              this.ngOnInit();
            } else {
              this.snackBar.open("Could Not Revert, Please try again.", "Ok", {
                duration: 3000,
              });
            }
          },
          () => {
            dialogRefLoad.close();
            this.navbar.role = "none";
            this.snackBar.open(
              "Session Timed Out! Please Sign-In again",
              "Ok",
              {
                duration: 3000,
              }
            );
            this.loginService.signOut();
          }
        );
      }
    });
  }

  showPreferencesProject(project) {
    const dialogRef = this.dialog.open(ShowFacultyPreferencesComponent, {
      disableClose: false,
      hasBackdrop: true,
      maxHeight: "700px",
      minWidth: "800px",
      data: project,
      panelClass: ["custom-dialog-container"],
    });
  }

  showPreferences(student) {
    const dialogRef = this.dialog.open(ShowStudentPreferencesComponent, {
      disableClose: false,
      hasBackdrop: true,
      maxHeight: "700px",
      minWidth: "800px",
      data: student,
      panelClass: ["custom-dialog-container"],
    });
  }

  resetProcess() {
    const dialogRef = this.dialog.open(ResetComponent, {
      width: "400px",
      height: "300px",
      disableClose: false,
      hasBackdrop: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result["message"] == "submit") {
        var dialogRefLoad = this.dialog.open(LoaderComponent, {
          data: "Please wait ...",
          disableClose: true,
          hasBackdrop: true,
        });
        this.loadingBar.start();
        this.userService.resetUsers().subscribe(
          (result) => {
            dialogRefLoad.close();
            this.loadingBar.stop();
            if (result["message"] == "success") {
              this.snackBar.open(
                "The alllocation process has been reinitialised",
                "Ok",
                {
                  duration: 3000,
                }
              );
              this.stepper.reset();
              this.ngOnInit();
            } else if (result["message"] == "invalid-token") {
              this.snackBar.open(
                "Session Expired! Please Sign-In Again",
                "Ok",
                {
                  duration: 3000,
                }
              );
              this.navbar.role = "none";
              this.loginService.signOut();
            }
          },
          () => {
            dialogRefLoad.close();
            this.navbar.role = "none";
            this.snackBar.open(
              "Session Timed Out! Please Sign-In again",
              "Ok",
              {
                duration: 3000,
              }
            );
            this.loginService.signOut();
          }
        );
      }
    });
  }

  downloadFile_project() {
    var dialogRefLoad = this.dialog.open(LoaderComponent, {
      data: "Please wait ...",
      disableClose: true,
      hasBackdrop: true,
    });
    this.exportService.download("project").subscribe(
      (data) => {
        dialogRefLoad.close();
        saveAs(data, `${this.programName}_faculty.csv`);
      },
      () => {
        dialogRefLoad.close();
        this.navbar.role = "none";
        this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
          duration: 3000,
        });
        this.loginService.signOut();
      }
    );
  }

  downloadFile_student() {
    var dialogRefLoad = this.dialog.open(LoaderComponent, {
      data: "Please wait ...",
      disableClose: true,
      hasBackdrop: true,
    });
    this.exportService.download("student").subscribe(
      (data) => {
        dialogRefLoad.close();
        saveAs(data, `${this.programName}_students.csv`);
      },
      () => {
        dialogRefLoad.close();
        this.navbar.role = "none";
        this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
          duration: 3000,
        });
        this.loginService.signOut();
      }
    );
  }

  downloadFile_format() {
    var dialogRefLoad = this.dialog.open(LoaderComponent, {
      data: "Please wait ...",
      disableClose: true,
      hasBackdrop: true,
    });
    this.exportService.download("format").subscribe(
      (data) => {
        dialogRefLoad.close();
        saveAs(data, `${this.programName}_format.csv`);
      },
      () => {
        dialogRefLoad.close();
        this.navbar.role = "none";
        this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
          duration: 3000,
        });
        this.loginService.signOut();
      }
    );
  }

  downloadFile_allocation() {
    var dialogRefLoad = this.dialog.open(LoaderComponent, {
      data: "Please wait ...",
      disableClose: true,
      hasBackdrop: true,
    });
    this.exportService.download("allocation").subscribe(
      (data) => {
        dialogRefLoad.close();
        saveAs(data, `${this.programName}_allocation.csv`);
      },
      () => {
        dialogRefLoad.close();
        this.navbar.role = "none";
        this.snackBar.open("Session Timed Out! Please Sign-In again", "Ok", {
          duration: 3000,
        });
        this.loginService.signOut();
      }
    );
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    if (this.fileToUpload.name.split(".")[1] == "csv") {
      const dialogRef = this.dialog.open(DeletePopUpComponent, {
        width: "400px",
        height: "200px",
        data: {
          heading: "Confirm Upload",
          message: `Are you sure that you want to upload ${this.fileToUpload.name} ?`,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result && result["message"] == "submit") {
          var dialogRefLoad = this.dialog.open(LoaderComponent, {
            data: "Please wait ...",
            disableClose: true,
            hasBackdrop: true,
          });
          this.exportService
            .uploadStudentList(this.fileToUpload, this.programName)
            .subscribe(
              (data) => {
                dialogRefLoad.close();
                if (data["status"] == "success") {
                  this.snackBar.open("Successfully uploaded the files.", "Ok", {
                    duration: 10000,
                  });
                  this.ngOnInit();
                } else if (data["status"] == "fail_parse") {
                  this.snackBar.open(data["msg"], "Ok", {
                    duration: 10000,
                  });
                } else {
                  this.snackBar.open(
                    "There was an unexpected error. Please reload and try again!",
                    "Ok",
                    {
                      duration: 10000,
                    }
                  );
                }
              },
              () => {
                dialogRefLoad.close();
                this.navbar.role = "none";
                this.snackBar.open(
                  "Session Timed Out! Please Sign-In again",
                  "Ok",
                  {
                    duration: 3000,
                  }
                );
                this.loginService.signOut();
              }
            );
        }
      });
    } else {
      this.snackBar.open(
        "Only .csv files are to imported. Other files types are not supported.",
        "Ok",
        {
          duration: 10000,
        }
      );
    }
  }

  publishToFaculty() {
    const dialogRef = this.dialog.open(DeletePopUpComponent, {
      width: "400px",
      height: "200px",
      data: {
        heading: "Confirm Publish",
        message: `Are you sure that you want to publish this allocation to faculty ? Do note that mails will be sent automatically.`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result["message"] == "submit") {
        var dialogRefLoad = this.dialog.open(LoaderComponent, {
          data: "Sending mails, Please wait as this may take a while",
          disableClose: true,
          hasBackdrop: true,
        });
        this.userService.updatePublish("faculty").subscribe(
          (data) => {
            if (data["status"] == "success") {
              this.dataSource = new MatTableDataSource(data["result"]);
              this.userService.uploadAllocationFile().subscribe(() => {});
              this.publishFaculty = true;
              localStorage.setItem("pf", "true");
              this.userService.getFacultyStreamEmails().subscribe((data1) => {
                if (data1["status"] == "success") {
                  this.mailer
                    .publishMail(
                      "faculty",
                      data1["result"],
                      data1["streamFull"]
                    )
                    .subscribe((data) => {
                      dialogRefLoad.close();
                      this.snackBar.open(
                        "Successfully published to faculties and mails have been sent.",
                        "Ok",
                        {
                          duration: 10000,
                        }
                      );
                    });
                }
              });
            }
          },
          () => {
            dialogRefLoad.close();
            this.navbar.role = "none";
            this.snackBar.open(
              "Session Timed Out! Please Sign-In again",
              "Ok",
              {
                duration: 3000,
              }
            );
            this.loginService.signOut();
          }
        );
      }
    });
  }

  publishToStudents() {
    const dialogRef = this.dialog.open(DeletePopUpComponent, {
      width: "400px",
      height: "200px",
      data: {
        heading: "Confirm Publish",
        message: `Are you sure that you want to publish this allocation to students ? Do note that mails will be sent automatically.`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result["message"] == "submit") {
        var dialogRefLoad = this.dialog.open(LoaderComponent, {
          data: "Sending mails, Please wait as this may take a while",
          disableClose: true,
          hasBackdrop: true,
        });

        this.userService.updatePublish("student").subscribe((data) => {
          if (data["status"] == "success") {
            this.dataSource = new MatTableDataSource(data["result"]);
            this.userService.uploadAllocationFile().subscribe(
              () => {},
              () => {
                dialogRefLoad.close();
                this.snackBar.open(
                  "Some Error Occured! Try again later.",
                  "OK",
                  {
                    duration: 3000,
                  }
                );
              }
            );
            this.publishStudents = true;
            localStorage.setItem("ps", "true");
            this.userService.getStudentStreamEmails().subscribe(
              (data1) => {
                if (data1["status"] == "success") {
                  this.mailer
                    .publishMail(
                      "student",
                      data1["result"],
                      data1["streamFull"]
                    )
                    .subscribe((data) => {
                      dialogRefLoad.close();
                      this.snackBar.open(
                        "Successfully published to students and mails have been sent.",
                        "Ok",
                        {
                          duration: 10000,
                        }
                      );
                    });
                }
              },
              () => {
                dialogRefLoad.close();
                this.navbar.role = "none";
                this.snackBar.open(
                  "Session Timed Out! Please Sign-In again",
                  "Ok",
                  {
                    duration: 3000,
                  }
                );
                this.loginService.signOut();
              }
            );
          }
        });
      }
    });
  }
  applyFilter(event: Event, who: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (who == "project") {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    } else if (who == "student") {
      this.students.filter = filterValue.trim().toLowerCase();
      this.studentCount = this.students.filteredData.length;
    } else if (who == "faculty") {
      this.faculties.filter = filterValue.trim().toLowerCase();
    }
  }
  ngOnDestroy() {
    clearInterval(this.timer);
  }

  sortStudents(event) {
    const isAsc = event.direction == "asc";
    this.students.data = this.students.data.sort((a, b) => {
      switch (event.active) {
        case "Name":
          return this.compare(a.name, b.name, isAsc);
        case "GPA":
          return this.compare(a.gpa, b.gpa, isAsc);
        case "Registered":
          return this.compare(a.isRegistered, b.isRegistered, isAsc);
        case "Email":
          return this.compare(
            Number(a.email.split("@")[0]),
            Number(b.email.split("@")[0]),
            isAsc
          );
        default:
          return 0;
      }
    });
  }

  sortFaculty(event) {
    const isAsc = event.direction == "asc";
    this.faculties.data = this.faculties.data.sort((a, b) => {
      switch (event.active) {
        case "Name":
          return this.compare(a.name, b.name, isAsc);
        case "GPA":
          return this.compare(a.gpa, b.gpa, isAsc);
        case "Registered":
          return this.compare(a.isRegistered, b.isRegistered, isAsc);
        case "NoOfProjects":
          return this.compare(a.noOfProjects, b.noOfProjects, isAsc);
        case "StudentIntake":
          return this.compare(
            a.included_studentIntake,
            b.included_studentIntake,
            isAsc
          );
        default:
          return 0;
      }
    });
  }

  sortProjects(event) {
    const isAsc = event.direction == "asc";
    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      switch (event.active) {
        case "select":
          return this.compare(
            this.selection.isSelected(a),
            this.selection.isSelected(b),
            isAsc
          );
        case "Title":
          return this.compare(a.title, b.title, isAsc);
        case "Faculty":
          return this.compare(a.faculty, b.faculty, isAsc);
        case "Duration":
          return this.compare(a.duration, b.duration, isAsc);
        case "isIncluded":
          return this.compare(a.isIncluded, b.isIncluded, isAsc);
        case "studentIntake":
          return this.compare(a.studentIntake, b.studentIntake, isAsc);
        case "NoOfStudents":
          return this.compare(
            a.numberOfPreferences,
            b.numberOfPreferences,
            isAsc
          );
        default:
          return 0;
      }
    });
  }

  compare(
    a: number | string | boolean,
    b: number | string | boolean,
    isAsc: boolean
  ) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
