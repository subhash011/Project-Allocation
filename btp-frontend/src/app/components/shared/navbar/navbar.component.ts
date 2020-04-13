import { MatSnackBar } from "@angular/material/snack-bar";
import { LoginComponent } from "./../login/login.component";
import { UserService } from "../../../services/user/user.service";
import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
  providers: [LoginComponent],
})
export class NavbarComponent implements OnInit {
  constructor(
    private router: Router,
    private userService: UserService,
    private login: LoginComponent,
    private snackBar: MatSnackBar
  ) {}
  role: string = "admin";
  checkPrograms: boolean = false;
  programs;
  adminProgram;

  ngOnInit() {
    if (localStorage.getItem("isLoggedIn") == "true") {
      this.role = localStorage.getItem("role");
    }
    if (this.role == "faculty" || this.role == "admin") {
      this.userService.getFacultyPrograms().subscribe((data) => {
        if (data["status"] == "success") {
          this.programs = data["programs"];
          if (this.programs.length > 0) {
            this.checkPrograms = true;
          }
        } else {
          let snackBarRef = this.snackBar.open(
            "Session Timed Out! Please Sign in Again!",
            "Ok",
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

  getSuperAdminURL() {
    return "super_admin/" + localStorage.getItem("id");
  }

  getUrlPreferences() {
    return (
      localStorage.getItem("role") +
      "/preferences/" +
      localStorage.getItem("id")
    );
  }

  getAddProjects() {
    return "/faculty/add-projects/" + localStorage.getItem("id");
  }

  getUrlProjects() {
    return (
      localStorage.getItem("role") + "/projects/" + localStorage.getItem("id")
    );
  }

  getProfile() {
    return "profile/" + localStorage.getItem("id");
  }

  getURLHome() {
    if (localStorage.getItem("role") == "admin") {
      return "faculty" + "/" + localStorage.getItem("id");
    } else {
      return localStorage.getItem("role") + "/" + localStorage.getItem("id");
    }
  }
  isUser() {
    if (localStorage.getItem("isLoggedIn") == "true")
      return (
        localStorage.getItem("role") == "student" ||
        localStorage.getItem("role") == "admin" ||
        localStorage.getItem("role") == "faculty" ||
        localStorage.getItem("role") == "super_admin"
      );
    else return false;
  }

  isFaculty() {
    if (localStorage.getItem("isLoggedIn") == "true")
      return (
        localStorage.getItem("role") == "admin" ||
        localStorage.getItem("role") == "faculty"
      );
    else return false;
  }

  isAdmin() {
    if (localStorage.getItem("isLoggedIn") == "true")
      return localStorage.getItem("role") == "admin";
    else return false;
  }

  isSuperAdmin() {
    if (localStorage.getItem("isLoggedIn") == "true")
      return localStorage.getItem("role") == "super_admin";
    else return false;
  }

  getAdmin() {
    // return "admin/" +
    let id = localStorage.getItem("id");
    this.router.navigate(["/admin", id]);
  }
  goToHome() {
    let id = localStorage.getItem("id");
    this.router
      .navigateByUrl("/refresh", {
        skipLocationChange: true,
      })
      .then(() => {
        this.ngOnInit();
        this.router.navigate([decodeURI("/faculty/" + id)]);
      });
  }


  goToProgram(program) {
    let id = localStorage.getItem("id");

    this.router.navigate(["/faculty", id], {
      queryParams: { name: program.full, abbr: program.short, mode:"programMode" },
    });
  }
}
