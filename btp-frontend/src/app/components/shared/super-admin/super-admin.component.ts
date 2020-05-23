import { LoadingBarService } from "@ngx-loading-bar/core";
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
import { LoaderComponent } from '../loader/loader.component';

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
    private login: LoginComponent,
    private loadingBar: LoadingBarService
  ) {}
  index = 0;
  background = "primary";
  projects: any = {};
  csproj: any = [];
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
  displayedColumnsMaps: string[] = [
    "Branch",
    "Short",
    "Map",
    "FacCount",
    "StudCount",
    "ProjCount",
    "Actions",
  ];
  displayedColumnsStreams: string[] = ["Stream", "Short", "Actions"];
  faculties: any = {};
  students: any = {};
  faculty;
  project;
  map;
  student;
  maps: any = [];
  branches: any = [];
  programs: any = [];
  hasAdmins = {};

  ngOnInit() {
    this.loadingBar.start();
    this.userService.getAllBranches().subscribe((maps) => {
      this.maps = maps["result"];
      this.branches = this.maps.map((val) => {
        var newMap = {
          name: val.full,
          short: val.short,
        };
        return newMap;
      });
    });
    this.userService.getAllMaps().subscribe((maps) => {
      this.maps = maps["result"];
      this.programs = this.maps.map((val) => {
        var newMap = {
          name: val.full,
          short: val.short,
          map: val.map,
        };
        return newMap;
      });
      const branches = this.programs;
      this.userService.getAllProjects().subscribe(
        (projects) => {
          if (projects["message"] == "success") {
            const project = projects["result"];
            for (const branch of branches) {
              this.projects[branch.short] = project.filter((val) => {
                return val.stream == branch.short;
              });
            }
          } else {
            this.snackBar.open("Please Sign-In Again to continue", "Ok", {
              duration: 3000,
            });
            this.login.signOut();
          }
        },
        () => {
          this.snackBar.open("Please Sign-In Again to continue", "Ok", {
            duration: 3000,
          });
          this.login.signOut();
        }
      );

      this.userService.getAllStudents().subscribe(
        (result) => {
          if (result["message"] == "success") {
            if (result["result"] == "no-students") {
              this.students = {};
            } else {
              var i = 0;
              for (const branch of this.programs) {
                this.students[branch.short] = result["result"][branch.short];
                i++;
              }
            }
          }
          this.loadingBar.stop();
        },
        () => {
          this.snackBar.open("Session Expired! Please Sign In Again", "Ok", {
            duration: 3000,
          });
          this.login.signOut();
        }
      );
      this.userService.getAllFaculties().subscribe(
        (result) => {
          if (result["message"] == "success") {
            if (result["result"] == "no-faculties") {
              this.faculties = {};
            } else {
              var i = 0;
              for (const branch of this.programs) {
                this.faculties[branch.short] = result["result"][branch.short];
                i++;
                this.hasAdmins[branch.short] =
                  this.faculties[branch.short].filter((val) => {
                    if (val.adminProgram && val.adminProgram == branch.short) {
                      return true;
                    }
                    return false;
                  }).length > 0
                    ? true
                    : false;
              }
            }
          }
        },
        () => {
          this.snackBar.open("Session Expired! Please Sign In Again", "Ok", {
            duration: 3000,
          });
          this.login.signOut();
        }
      );
    });
  }

  addPrograms() {
    let dialogRef = this.dialog.open(AddMapComponent, {
      width: "40%",
      data: {
        heading: "Program",
        message: "Are you sure you want to proceed to add program",
        add: "program",
      },
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data && data["message"] == "submit") {
        this.loadingBar.start();
        var dialogRef = this.dialog.open(LoaderComponent, {
          data: "Loading Please Wait ....",
          disableClose: true,
          hasBackdrop: true,
        });
        this.userService.setProgram(data["map"]).subscribe((data) => {
          dialogRef.close();
          if (data["message"] == "success") {
            this.ngOnInit();
            const snackBarRef = this.snackBar.open(
              "Added Program Successfully",
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
  deleteProgram(short) {
    let dialogRef = this.dialog.open(DeletePopUpComponent, {
      height: "200px",
      data: {
        heading: "Confirm Deletion",
        message: "Are you sure you want to remove the program",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result["message"] == "submit") {
        this.loadingBar.start();

        var dialogRef = this.dialog.open(LoaderComponent, {
          data: "Loading Please Wait ....",
          disableClose: true,
          hasBackdrop: true,
        });

        this.userService.removeProgram(short).subscribe((result) => {
          dialogRef.close();
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
            this.snackBar.open("Removed Program", "Ok", {
              duration: 3000,
            });
          }
        });
      }
    });
  }

  addBranches() {
    let dialogRef = this.dialog.open(AddMapComponent, {
      width: "40%",
      data: {
        heading: "Stream",
        message: "Are you sure you want to proceed to add stream",
        add: "branch",
      },
    });
    dialogRef.afterClosed().subscribe((data) => {
      if (data && data["message"] == "submit") {
        this.loadingBar.start();

        var dialogRef = this.dialog.open(LoaderComponent, {
          data: "Loading Please Wait ....",
          disableClose: true,
          hasBackdrop: true,
        });


        this.userService.setBranch(data["map"]).subscribe((data) => {
          dialogRef.close();
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

  deleteBranch(short) {
    let dialogRef = this.dialog.open(DeletePopUpComponent, {
      height: "200px",
      data: {
        heading: "Confirm Deletion",
        message: "Are you sure you want to remove the stream",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result["message"] == "submit") {
        this.loadingBar.start();

        var dialogRef = this.dialog.open(LoaderComponent, {
          data: "Loading Please Wait ....",
          disableClose: true,
          hasBackdrop: true,
        });

        this.userService.removeBranch(short).subscribe((result) => {
          dialogRef.close();
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
            this.snackBar.open("Removed Stream", "Ok", {
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
        this.loadingBar.start();
        var dialogRef = this.dialog.open(LoaderComponent, {
          data: "Loading Please Wait ....",
          disableClose: true,
          hasBackdrop: true,
        });
        this.userService.removeFaculty(faculty).subscribe(
          (result) => {
            dialogRef.close();
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
          },
          () => {
            this.snackBar.open("Some Error Occured! Try Again.", "Ok", {
              duration: 3000,
            });
          }
        );
      }
    });
  }
  addAdmin(faculty, branch) {
    this.loadingBar.start();
    this.userService.addAdmin(faculty, branch).subscribe(() => {
      this.ngOnInit();
    });
  }
  removeAdmin(faculty) {
    this.loadingBar.start();
    this.userService.removeAdmin(faculty).subscribe(() => {
      this.ngOnInit();
    });
  }

  getToolTipToRemoveFaculty(faculty, branch) {
    if (faculty.isAdmin) {
      if (faculty.adminProgram == branch) {
        return "Remove co-ordinator Status to delete the faculty";
      } else {
        return (
          "This faculty is a co-ordinator for " +
          faculty.adminProgram +
          " please remove the co-ordinator status to remove the faculty"
        );
      }
    } else {
      return "";
    }
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
        this.loadingBar.start();
        this.userService.removeStudent(student).subscribe(
          (result) => {
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
          },
          () => {
            this.snackBar.open("Some Error Occured! Try Again.", "Ok", {
              duration: 3000,
            });
          }
        );
      }
    });
  }
}
