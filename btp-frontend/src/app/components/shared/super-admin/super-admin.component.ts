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
  SimpleChanges
} from "@angular/core";

@Component({
  selector: "app-super-admin",
  templateUrl: "./super-admin.component.html",
  styleUrls: ["./super-admin.component.scss"]
})
export class SuperAdminComponent implements OnInit {
  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  index = 0;
  background = "primary";
  displayedColumnsFaculty: string[] = [
    "Name",
    "Stream",
    "Email-ID",
    "isAdmin",
    "Actions"
  ];
  displayedColumnsStudent: string[] = ["Name", "Stream", "Email-ID", "Actions"];
  faculties: any = {};
  students: any = {};
  faculty;
  student;
  branches = [
    { name: "Computer Science And Engineering", short: "CSE" },
    { name: "Electrical Engineering", short: "EE" },
    { name: "Mechanical Engineering", short: "ME" },
    { name: "Civil Engineering", short: "CE" }
  ];

  ngOnInit() {
    localStorage.setItem("role", "super_admin"); //should be removed
    localStorage.setItem("isLoggedIn", "true"); //should be removed
    this.userService
      .getAllStudents()
      .toPromise()
      .then(result => {
        if (result["message"] == "success") {
          if (result["result"] == "no-students") {
            this.students = {
              CSE: [],
              EE: [],
              ME: [],
              CE: []
            };
          } else {
            var i = 0;
            for (const branch of this.branches) {
              this.students[branch.short] = result["result"][i];
              i++;
            }
          }
        }
      });
    this.userService
      .getAllFaculties()
      .toPromise()
      .then(result => {
        if (result["message"] == "success") {
          if (result["result"] == "no-faculties") {
            this.faculties = {
              CSE: [],
              EE: [],
              ME: [],
              CE: []
            };
          } else {
            var i = 0;
            for (const branch of this.branches) {
              this.faculties[branch.short] = result["result"][i];
              i++;
            }
          }
        }
      });
  }
  deleteFaculty(faculty) {
    let dialogRef = this.dialog.open(DeletePopUpComponent, {
      height: "200px",
      data: "remove faculty"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result["message"] == "submit") {
        this.userService
          .removeFaculty(faculty)
          .toPromise()
          .then(result => {
            console.log();
            if (result["message"] == "success") {
              this.snackBar.open("Successfully Deleted Faculty", "OK", {
                duration: 3000
              });
            } else if (result["message"] == "error") {
              this.snackBar.open("Some Error Occured! Try Again.", "Ok", {
                duration: 3000
              });
            }
            this.ngOnInit();
          })
          .catch(err => {
            this.snackBar.open("Some Error Occured! Try Again.", "Ok", {
              duration: 3000
            });
          });
      }
    });
  }
  addAdmin(faculty) {
    this.userService
      .addAdmin(faculty)
      .toPromise()
      .then(result => {
        this.ngOnInit();
      });
  }
  removeAdmin(faculty) {
    this.userService
      .removeAdmin(faculty)
      .toPromise()
      .then(result => {
        this.ngOnInit();
      });
  }
  deleteStudent(student) {
    let dialogRef = this.dialog.open(DeletePopUpComponent, {
      height: "200px",
      data: "remove student"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result["message"] == "submit") {
        this.userService
          .removeStudent(student)
          .toPromise()
          .then(result => {
            console.log();
            if (result["message"] == "success") {
              this.snackBar.open("Successfully Deleted Student", "OK", {
                duration: 3000
              });
            } else if (result["message"] == "error") {
              this.snackBar.open("Some Error Occured! Try Again.", "Ok", {
                duration: 3000
              });
            }
            this.ngOnInit();
          })
          .catch(err => {
            this.snackBar.open("Some Error Occured! Try Again.", "Ok", {
              duration: 3000
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
