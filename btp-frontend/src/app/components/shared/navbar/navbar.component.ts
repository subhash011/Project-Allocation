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
    if (this.userService) {
      this.role = this.userService.role.toString();
    }
  }

  getUrlPreferences() {
    return (
      "/" +
      this.userService.role +
      "/" +
      this.userService.user.id +
      "/preferences"
    );
  }

  redirectToHome() {
    this.router.navigate([""]);
  }
  isUser() {
    if (this.userService.user)
      return (
        this.userService.role.toString() == "student" ||
        this.userService.role.toString() == "admin" ||
        this.userService.role.toString() == "faculty"
      );
    else return false;
  }

  isFaculty() {
    if (this.userService.user)
      return (
        this.userService.role.toString() == "admin" ||
        this.userService.role.toString() == "faculty"
      );
    else return false;
  }

  isAdmin() {
    if (this.userService.user)
      return this.userService.role.toString() == "admin";
    else return false;
  }

  isSuperAdmin() {
    if (this.userService.user)
      return this.userService.role.toString() == "super_admin";
    else return false;
  }
}
