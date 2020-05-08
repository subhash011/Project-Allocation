import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserService } from "./../../../services/user/user.service";
import { HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  maps: any;
  branches: any = [];
  programs: any = [];
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}
  branchStudent: any;
  ngOnInit() {
    this.userService
      .getAllBranches()
      .toPromise()
      .then((maps) => {
        this.maps = maps["result"];
        for (const map of this.maps) {
          const newObj = {
            name: map.full,
            short: map.short,
          };
          this.branches.push(newObj);
        }
      });
    this.userService
      .getAllMaps()
      .toPromise()
      .then((maps) => {
        this.maps = maps["result"];
        for (const map of this.maps) {
          const newObj = {
            name: map.full,
            short: map.short,
            map: map.map,
            length: map.length,
          };
          this.programs.push(newObj);
        }
        return this.programs;
      })
      .then(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        this.userForm.get("email").disable();
        if (localStorage.getItem("role") == "super_admin") {
          this.userForm.get("branch").clearValidators();
        }
        if (localStorage.getItem("role") == "student") {
          this.userForm.get("branch").disable();
          const stream = this.getStream();
          this.branchStudent = stream;
          if (this.branchStudent != "invalid") {
            this.userForm.controls["branch"].setValue(this.branchStudent);
          } else {
            this.userForm.controls["branch"].setErrors({
              required: true,
            });
            this.userForm.get("branch").updateValueAndValidity();
          }
        } else if (localStorage.getItem("role") == "faculty") {
          this.userForm.get("CGPA").clearValidators();
          this.userForm.get("CGPA").updateValueAndValidity();
        } else {
          this.userForm.get("CGPA").clearValidators();
          this.userForm.get("branch").clearValidators();
          this.userForm.get("CGPA").updateValueAndValidity();
          this.userForm.get("branch").updateValueAndValidity();
        }
      });
  }
  user = JSON.parse(localStorage.getItem("user"));
  userForm = this.fb.group({
    firstName: [this.user.firstName, Validators.required],
    lastName: [this.user.lastName, Validators.required],
    CGPA: [
      null,
      Validators.compose([
        Validators.required,
        Validators.max(10),
        Validators.min(0),
      ]),
    ],
    email: [this.user.email, Validators.required],
    branch: [null, Validators.required],
  });
  message = "";
  hasUnitNumber = false;

  getStream() {
    if (localStorage.getItem("role") == "student") {
      const user = JSON.parse(localStorage.getItem("user"));
      const rollno = user.email.split("@")[0];
      for (const branch of this.programs) {
        const pattern = new RegExp(branch.map.split("|")[1]);
        if (
          pattern.exec(rollno) &&
          pattern.exec(rollno).index == branch.length
        ) {
          return branch.short;
        }
      }
      return "invalid";
    }
    return "invalid";
  }

  getRole() {
    if (localStorage.getItem("role") == "student") {
      return true;
    } else {
      return false;
    }
  }

  isFaculty() {
    if (localStorage.getItem("role") == "faculty") {
      return true;
    } else {
      return false;
    }
  }

  isSuperAdmin() {
    if (localStorage.getItem("role") == "super_admin") {
      return true;
    } else {
      return false;
    }
  }

  onSubmit() {
    if (this.userForm.valid) {
      var user = {
        name:
          this.userForm.get("firstName").value +
          " " +
          this.userForm.get("lastName").value,
        roll_no: String(this.userForm.get("email").value).split("@")[0],
        email: this.userForm.get("email").value,
        gpa: this.userForm.get("CGPA").value,
        stream: this.userForm.get("branch").value,
      };
      user.name =
        localStorage.getItem("role") == "student"
          ? user.name.toUpperCase()
          : user.name;
      const _user = JSON.parse(localStorage.getItem("user"));

      const httpOptions = {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization: _user.idToken,
        }),
      };

      var position = "";
      position = localStorage.getItem("role");
      var id = _user.id;
      this.userService
        .registerUser(user, httpOptions, position, id)
        .toPromise()
        .then((data: any) => {
          if (data["registration"] == "success") {
            localStorage.setItem("role", position);
            localStorage.removeItem("isRegistered");
            var snackBarRef = this.snackBar.open(
              "Registration Successful",
              "Ok",
              {
                duration: 3000,
              }
            );
            var route = "/" + position + "/" + id;
            this.router.navigate([route]);
          } else {
            var snackBarRef = this.snackBar.open(
              "Registration Failed! Please Try Again",
              "Ok",
              {
                duration: 3000,
              }
            );
          }
        })
        .catch(() => {
          var snackBarRef = this.snackBar.open(
            "Registration Failed! Please Try Again",
            "Ok",
            {
              duration: 3000,
            }
          );
        });
    }
  }
}
