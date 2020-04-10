import { AddMapComponent } from "./../add-map/add-map.component";
import { LoginComponent } from "./../login/login.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeletePopUpComponent } from "./../../faculty-componenets/delete-pop-up/delete-pop-up.component";
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "./../../../services/user/user.service";
import {
  Component,
  OnInit,
  DoCheck,
  OnChanges,
  SimpleChange,
  SimpleChanges,
} from "@angular/core";

@Component({
  selector: "app-super-admin",
  templateUrl: "./super-admin.component.html",
  styleUrls: ["./super-admin.component.scss"],
  providers: [LoginComponent],
})
export class SuperAdminComponent implements OnInit {
  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private login: LoginComponent
  ) {}
  index = 0;
  background = "primary";
  projects: any = [];
  displayedColumnsFaculty: string[] = [
    "Name",
    "Stream",
    "Email-ID",
    "isAdmin",
    "Actions",
  ];
  displayedColumnsStudent: string[] = [
    "Name",
    "Stream",
    "Email-ID",
    "CGPA",
    "Actions",
  ];
  displayedColumnsProjects: string[] = [
    "Title",
    "Faculty",
    "Stream",
    "NoOfStudents",
    "Duration",
  ];
  displayedColumnsMaps: string[] = ["Branch", "Short", "Map", "Actions"];
  faculties: any = {};
  students: any = {};
  faculty;
  project;
  map;
  student;
  maps: any = [];
  branches: any = [];

  ngOnInit() {
    this.userService
      .getAllMaps()
      .toPromise()
      .then((maps) => {
        this.maps = maps["result"];
        this.branches = this.maps.map((val) => {
          var newMap = {
            name: val.full,
            short: val.short,
            map: val.map,
          };
          return newMap;
        });
        return this.branches;
      })
      .then(() => {
        this.userService
          .getAllProjects()
          .toPromise()
          .then((projects) => {
            if (projects["message"] == "success") {
              this.projects = projects["result"];
            } else {
              this.snackBar.open("Please Sign-In Again to continue", "Ok", {
                duration: 3000,
              });
              this.login.signOut();
            }
          })
          .catch(() => {
            this.snackBar.open("Please Sign-In Again to continue", "Ok", {
              duration: 3000,
            });
            this.login.signOut();
          });

        this.userService
          .getAllStudents()
          .toPromise()
          .then((result) => {
            if (result["message"] == "success") {
              if (result["result"] == "no-students") {
                this.students = {};
              } else {
                var i = 0;
                for (const branch of this.branches) {
                  this.students[branch.short] = result["result"][i];
                  i++;
                }
              }
            }
          })
          .catch(() => {
            this.snackBar.open("Session Expired! Please Sign In Again", "Ok", {
              duration: 3000,
            });
            this.login.signOut();
          });
        this.userService
          .getAllFaculties()
          .toPromise()
          .then((result) => {
            if (result["message"] == "success") {
              if (result["result"] == "no-faculties") {
                this.faculties = {};
              } else {
                var i = 0;
                for (const branch of this.branches) {
                  this.faculties[branch.short] = result["result"][i];
                  i++;
                }
              }
            }
          })
          .catch(() => {
            this.snackBar.open("Session Expired! Please Sign In Again", "Ok", {
              duration: 3000,
            });
            this.login.signOut();
          });
      });
  }

  addMap() {
    let dialogRef = this.dialog.open(AddMapComponent, {
      width: "40%",
      data: {
        heading: "Confirm",
        message: "Are you sure you want to proceed to add branch",
      },
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data && data["message"] == "submit") {
        this.userService
          .setMap(data["map"])
          .toPromise()
          .then((data) => {
            if (data["message"] == "success") {
              this.ngOnInit();
              const snackBarRef = this.snackBar.open(
                "Added Branch Successfully",
                "Ok",
                {
                  duration: 3000,
                }
              );
            }
          });
      }
    });
  }

  deleteMap(short) {
    let dialogRef = this.dialog.open(DeletePopUpComponent, {
      height: "200px",
      data: {
        heading: "Confirm Deletion",
        message: "Are you sure you want to remove the branch",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result["message"] == "submit") {
        this.userService
          .removeMap(short)
          .toPromise()
          .then((result) => {
            if (result["message"] == "invalid-token") {
              this.login.signOut();
              this.snackBar.open(
                "Session Timed Out! Please Sign-In Again",
                "Ok",
                {
                  duration: 3000,
                }
              );
            } else {
              this.ngOnInit();
              this.snackBar.open("Removed Branch", "Ok", {
                duration: 3000,
              });
            }
          });
      }
    });
  }

  deleteFaculty(faculty) {
    let dialogRef = this.dialog.open(DeletePopUpComponent, {
      height: "200px",
      data: {
        heading: "Confirm Removal",
        message: "Are you sure you want to remove this faculty",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result["message"] == "submit") {
        this.userService
          .removeFaculty(faculty)
          .toPromise()
          .then((result) => {
            if (result["message"] == "success") {
              this.snackBar.open("Successfully Deleted Faculty", "OK", {
                duration: 3000,
              });
            } else if (result["message"] == "error") {
              this.snackBar.open("Some Error Occured! Try Again.", "Ok", {
                duration: 3000,
              });
            } else {
              this.login.signOut();
              this.snackBar.open(
                "Session Expired! Please Sign-In Again.",
                "Ok",
                {
                  duration: 3000,
                }
              );
            }
            this.ngOnInit();
          })
          .catch(() => {
            this.snackBar.open("Some Error Occured! Try Again.", "Ok", {
              duration: 3000,
            });
          });
      }
    });
  }
  addAdmin(faculty) {
    this.userService
      .addAdmin(faculty)
      .toPromise()
      .then(() => {
        this.ngOnInit();
      });
  }
  removeAdmin(faculty) {
    this.userService
      .removeAdmin(faculty)
      .toPromise()
      .then(() => {
        this.ngOnInit();
      });
  }
  deleteStudent(student) {
    let dialogRef = this.dialog.open(DeletePopUpComponent, {
      height: "200px",
      data: {
        heading: "Confirm Removal",
        message: "Are you sure you want to remove this student",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result["message"] == "submit") {
        this.userService
          .removeStudent(student)
          .toPromise()
          .then((result) => {
            console.log();
            if (result["message"] == "success") {
              this.snackBar.open("Successfully Deleted Student", "OK", {
                duration: 3000,
              });
            } else if (result["message"] == "error") {
              this.snackBar.open("Some Error Occured! Try Again.", "Ok", {
                duration: 3000,
              });
            }
            this.ngOnInit();
          })
          .catch((err) => {
            this.snackBar.open("Some Error Occured! Try Again.", "Ok", {
              duration: 3000,
            });
          });
      }
    });
  }
  getURL() {
    const user = JSON.parse(localStorage.getItem("user"));
    return "url('https://img.icons8.com/material/48/000000/person-male.png')";
    // return "url(" + user.photoUrl + ")";
  }
}
