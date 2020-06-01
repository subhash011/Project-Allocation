import { AddMapComponent } from "./../add-map/add-map.component";
import { LoginComponent } from "./../login/login.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DeletePopUpComponent } from "./../../faculty-componenets/delete-pop-up/delete-pop-up.component";
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "./../../../services/user/user.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { LoaderComponent } from "../loader/loader.component";
import { MatTable, MatTableDataSource } from "@angular/material";

@Component({
  selector: "app-super-admin",
  templateUrl: "./super-admin.component.html",
  styleUrls: ["./super-admin.component.scss"],
  providers: [LoginComponent],
})
export class SuperAdminComponent implements OnInit {
  @ViewChild("table", { static: false }) table: MatTable<any>;
  dialogRefLoad: any;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private login: LoginComponent
  ) {}
  index = 0;
  background = "primary";
  projects: any = {};
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
    "isRegistered",
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
  branches: any = new MatTableDataSource([]);
  programs: any = new MatTableDataSource([]);
  hasAdmins = {};

  ngOnInit() {
    this.dialogRefLoad = this.dialog.open(LoaderComponent, {
      data: "Loading. Please wait! ...",
      disableClose: true,
      hasBackdrop: true,
    });
    this.userService.getAllBranches().subscribe(
      (maps) => {
        if (maps["message"] == "success") {
          this.maps = maps["result"];
          this.branches.data = this.maps.map((val) => {
            var newMap = {
              name: val.full,
              short: val.short,
            };
            return newMap;
          });
        } else {
          this.snackBar.open(
            "Some error occured! Please re-authenticate if the error persists",
            "Ok",
            {
              duration: 3000,
            }
          );
        }
      },
      () => {
        this.dialogRefLoad.close();
        this.snackBar.open(
          "Some error occured! Please re-authenticate if the error persists",
          "Ok",
          {
            duration: 3000,
          }
        );
      }
    );
    this.userService.getAllMaps().subscribe(
      (maps) => {
        this.maps = maps["result"];
        this.programs.data = this.maps.map((val) => {
          var newMap = {
            name: val.full,
            short: val.short,
            map: val.map,
          };
          return newMap;
        });

        this.userService.getAllStudents().subscribe(
          (result) => {
            if (result["message"] == "success") {
              if (result["result"] == "no-students") {
                for (const branch of this.programs.data) {
                  this.students[branch.short] = new MatTableDataSource([]);
                }
              } else {
                var i = 0;
                for (const branch of this.programs.data) {
                  this.students[branch.short] = new MatTableDataSource(
                    result["result"][branch.short]
                  );
                  this.students[branch.short].filterPredicate = (
                    data: any,
                    filter: string
                  ) =>
                    !filter ||
                    data.name.toLowerCase().includes(filter) ||
                    data.roll_no.toLowerCase().includes(filter);
                }
              }
            }
          },
          () => {
            this.dialogRefLoad.close();
            this.snackBar.open("Session Expired! Please Sign In Again", "Ok", {
              duration: 3000,
            });
            this.login.signOut();
          }
        );

        this.getAllProjects();

        this.userService.getAllFaculties().subscribe(
          (result) => {
            this.dialogRefLoad.close();
            if (result["message"] == "success") {
              if (result["result"] == "no-faculties") {
                for (const branch of this.programs.data) {
                  this.faculties[branch.short] = new MatTableDataSource([]);
                }
              } else {
                var i = 0;
                for (const branch of this.programs.data) {
                  this.faculties[branch.short] = new MatTableDataSource(
                    result["result"][branch.short]
                  );
                  this.faculties[branch.short].filterPredicate = (
                    data: any,
                    filter: string
                  ) =>
                    !filter ||
                    data.name.toLowerCase().includes(filter) ||
                    data.stream.toLowerCase().includes(filter) ||
                    data.email.toLowerCase().includes(filter);
                  this.hasAdmins[branch.short] =
                    this.faculties[branch.short].data.filter((val) => {
                      if (
                        val.adminProgram &&
                        val.adminProgram == branch.short
                      ) {
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
            this.dialogRefLoad.close();
            this.snackBar.open("Session Expired! Please Sign In Again", "Ok", {
              duration: 3000,
            });
            this.login.signOut();
          }
        );
      },
      () => {
        this.dialogRefLoad.close();
        this.snackBar.open(
          "Some error occured! Please re-authenticate if the error persists",
          "Ok",
          {
            duration: 3000,
          }
        );
      }
    );
  }

  getAllProjects() {
    const branches = this.programs.data;
    this.userService.getAllProjects().subscribe(
      (projects) => {
        if (projects["message"] == "success") {
          const project = projects["result"];
          for (const branch of branches) {
            const projectsTemp = project.filter((val) => {
              return val.stream == branch.short;
            });
            this.projects[branch.short] = new MatTableDataSource(projectsTemp);
            this.projects[branch.short].filterPredicate = (
              data: any,
              filter: string
            ) =>
              !filter ||
              data.faculty.toLowerCase().includes(filter) ||
              data.title.toLowerCase().includes(filter);
          }
        } else {
          this.dialogRefLoad.close();
          this.snackBar.open("Please Sign-In Again to continue", "Ok", {
            duration: 3000,
          });
          this.login.signOut();
        }
      },
      () => {
        this.dialogRefLoad.close();
        this.snackBar.open("Please Sign-In Again to continue", "Ok", {
          duration: 3000,
        });
        this.login.signOut();
      }
    );
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
        var dialogRef = this.dialog.open(LoaderComponent, {
          data: "Adding Program. Please wait ...",
          disableClose: true,
          hasBackdrop: true,
        });
        this.userService.setProgram(data["map"]).subscribe((data) => {
          dialogRef.close();
          if (data["message"] == "success") {
            var val = data["result"];
            var newMap = {
              name: val.full,
              short: val.short,
              map: val.map,
            };
            this.programs.data.push(newMap);
            this.programs.data = [...this.programs.data];
            const snackBarRef = this.snackBar.open(
              "Added Program Successfully",
              "Ok",
              {
                duration: 3000,
              }
            );
          } else if (data["message"] == "invalid-token") {
            this.login.signOut();
            this.snackBar.open(
              "Session Timed Out! Please Sign-In Again",
              "Ok",
              {
                duration: 3000,
              }
            );
          } else {
            this.snackBar.open(
              "Some error occured! If error persists re-authenticate",
              "Ok",
              {
                duration: 5000,
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
        var dialogRef = this.dialog.open(LoaderComponent, {
          data: "Removing Program, Please wait ...",
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
            this.programs.data = this.programs.data.filter(
              (val) => val.short != short
            );
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
        var dialogRef = this.dialog.open(LoaderComponent, {
          data: "Please wait ...",
          disableClose: true,
          hasBackdrop: true,
        });

        this.userService.setBranch(data["map"]).subscribe((data) => {
          dialogRef.close();
          if (data["message"] == "success") {
            const val = data["result"];
            var newMap = {
              name: val.full,
              short: val.short,
            };
            this.branches.data.push(newMap);
            //the below line is necessary to render the table
            this.branches.data = [...this.branches.data];
            const snackBarRef = this.snackBar.open(
              "Added Stream Successfully",
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
        var dialogRef = this.dialog.open(LoaderComponent, {
          data: "Removing stream. Please wait ...",
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
            this.branches.data = this.branches.data.filter(
              (val) => val.short != short
            );
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
        var dialogRef = this.dialog.open(LoaderComponent, {
          data: "Removing faculty. Please wait ...",
          disableClose: true,
          hasBackdrop: true,
        });
        this.userService.removeFaculty(faculty._id).subscribe(
          (result) => {
            dialogRef.close();
            if (result["message"] == "success") {
              for (const program of this.programs.data) {
                this.faculties[program.short].data = this.faculties[
                  program.short
                ].data.filter((val) => {
                  return val._id != faculty._id;
                });
                this.projects[program.short].data = this.projects[
                  program.short
                ].data.filter((val) => val.faculty_id != faculty._id);
              }
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
    var dialogRef = this.dialog.open(LoaderComponent, {
      data: "Adding admin. Please wait ...",
      disableClose: true,
      hasBackdrop: true,
    });
    this.userService.addAdmin(faculty._id, branch).subscribe((result) => {
      dialogRef.close();
      if (result["message"] == "success") {
        this.hasAdmins[branch] = true;
        for (const program of this.programs.data) {
          this.faculties[program.short].data = this.faculties[
            program.short
          ].data.map((val) => {
            if (val._id == faculty._id) {
              val.isAdmin = true;
              val.adminProgram = branch;
            }
            return val;
          });
        }
      } else if (result["message"] == "invalid-token") {
        this.login.signOut();
        this.snackBar.open("Session Timed Out! Please Sign-In Again", "Ok", {
          duration: 3000,
        });
      }
    });
  }
  removeAdmin(faculty, branch) {
    var dialogRef = this.dialog.open(LoaderComponent, {
      data: "Adding admin. Please wait ...",
      disableClose: true,
      hasBackdrop: true,
    });
    this.userService.removeAdmin(faculty._id).subscribe((result) => {
      dialogRef.close();
      if (result["message"] == "success") {
        this.hasAdmins[branch] = false;
        for (const program of this.programs.data) {
          this.faculties[program.short].data = this.faculties[
            program.short
          ].data.map((val) => {
            if (val._id == faculty._id) {
              val.isAdmin = false;
              val.adminProgram = result["result"];
            }
            return val;
          });
        }
      } else if (result["message"] == "invalid-token") {
        this.login.signOut();
        this.snackBar.open("Session Timed Out! Please Sign-In Again", "Ok", {
          duration: 3000,
        });
      }
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
        var dialogRef = this.dialog.open(LoaderComponent, {
          data: "Please wait ....",
          disableClose: true,
          hasBackdrop: true,
        });
        this.userService.removeStudent(student._id).subscribe(
          (result) => {
            dialogRef.close();
            if (result["message"] == "success") {
              this.students[student.stream].data = this.students[
                student.stream
              ].data.filter((val) => val._id != student._id);
              this.students[student.stream].data = [
                ...this.students[student.stream].data,
              ];
              this.snackBar.open("Successfully Deleted Student", "OK", {
                duration: 3000,
              });
              this.getAllProjects();
            } else if (result["message"] == "error") {
              this.snackBar.open("Some Error Occured! Try Again.", "Ok", {
                duration: 3000,
              });
            }
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

  applyFilter(event: Event, branch: any, who: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (who == "faculty") {
      this.faculties[branch.short].filter = filterValue.trim().toLowerCase();
    } else if (who == "student") {
      this.students[branch.short].filter = filterValue.trim().toLowerCase();
    } else if (who == "project") {
      this.projects[branch.short].filter = filterValue.trim().toLowerCase();
    }
  }
}
