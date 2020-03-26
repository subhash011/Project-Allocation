import { UserService } from "../../../services/user/user.service";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { Component, OnInit } from "@angular/core";
@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"]
})
export class NavbarComponent implements OnInit {
  constructor(private router: Router, private userService: UserService) {}
  role: string = "admin";
  ngOnInit() {
    if (localStorage.getItem("isLoggedIn") == "true") {
      this.role = localStorage.getItem("role");
    }
  }

  getUrlPreferences() {
    return (
      "/" +
      localStorage.getItem("role") +
      "/preferences/" +
      localStorage.getItem("id")
    );
  }

  getUrlProjects() {
    return (
      "/" +
      localStorage.getItem("role") +
      "/projects/" +
      localStorage.getItem("id")
    );
  }

  redirectToHome() {
    this.router.navigate([""]);
  }
  isUser() {
    if (localStorage.getItem("isLoggedIn") == "true")
      return (
        localStorage.getItem("role") == "student" ||
        localStorage.getItem("role") == "admin" ||
        localStorage.getItem("role") == "faculty"
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
}
