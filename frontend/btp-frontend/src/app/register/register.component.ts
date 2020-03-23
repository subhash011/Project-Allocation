import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})
export class RegisterComponent {
  isStudent = false;

  addressForm = this.fb.group({
    company: null,
    firstName: [null, Validators.required],
    lastName: [null, Validators.required],
    CGPA: [null, Validators.required],
    email: [null, Validators.required],
    branch: [null, Validators.required],
    shipping: ["free", Validators.required]
  });

  hasUnitNumber = false;

  branches = [
    { name: "Computer Science and Engineering", abbreviation: "CSE" },
    { name: "Electrical Engineering", abbreviation: "EE" },
    { name: "Mechanical Engineering", abbreviation: "ME" },
    { name: "Civil Engineering", abbreviation: "CE" }
  ];

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    alert("Thanks!");
  }
}
