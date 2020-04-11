import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserService } from "./../../../services/user/user.service";
import { HttpHeaders } from "@angular/common/http";
import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: "app-add-map",
  templateUrl: "./add-map.component.html",
  styleUrls: ["./add-map.component.scss"],
})
export class AddMapComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddMapComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  addForm = this.fb.group({
    full: [null, Validators.required],
    short: [
      null,
      Validators.compose([
        Validators.required,
        Validators.pattern("[a-zA-Z]*"),
      ]),
    ],
    map: [null, Validators.required],
  });

  onNoClick() {
    this.dialogRef.close({ message: "close" });
  }

  onSubmit() {
    if (this.addForm.valid) {
      const map = {
        full: this.addForm.get("full").value,
        short: this.addForm.get("short").value.toUpperCase(),
        map: this.addForm.get("map").value,
      };
      this.dialogRef.close({ map: map, message: "submit" });
    }
  }
}
