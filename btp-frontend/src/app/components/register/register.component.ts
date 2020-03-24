import { UserService } from "./../../services/user/user.service";
import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})
export class RegisterComponent {
  constructor(
    private fb: FormBuilder,
    private httpClient: HttpClient,
    private userService: UserService
  ) {}
  isStudent = true;
  json = "";
  branch = "";
  userForm = this.fb.group({
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    CGPA: [null, Validators.required],
    email: [null, Validators.required],
    branch: [null, Validators.required]
  });
  message = "";
  hasUnitNumber = false;

  branches = [
    { name: "Computer Science and Engineering", abbreviation: "CSE" },
    { name: "Electrical Engineering", abbreviation: "EE" },
    { name: "Mechanical Engineering", abbreviation: "ME" },
    { name: "Civil Engineering", abbreviation: "CE" }
  ];

  onSubmit() {
    const student = {
      name:
        this.userForm.get("firstName").value +
        " " +
        this.userForm.get("lastName").value,
      roll_no: String(this.userForm.get("email").value).split("@")[0],
      email: this.userForm.get("email").value,
      gpa: this.userForm.get("CGPA").value,
      stream: this.userForm.get("branch").value
    };
    this.httpClient
      .post("http://localhost:3000/student/register", student)
      .toPromise()
      .then((data: any) => {
        this.message = data.message;
      });
  }
}
