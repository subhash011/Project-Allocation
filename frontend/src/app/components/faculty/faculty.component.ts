import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { UserDetailsService } from "src/app/services/user-details.service";

@Component({
  selector: "app-faculty",
  templateUrl: "./faculty.component.html",
  styleUrls: ["./faculty.component.css"]
})
export class FacultyComponent implements OnInit {
  private id: String;

  constructor(
    private activatedRoute: ActivatedRoute,
    private userDetails: UserDetailsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
      this.id = params.get("id");
      console.log(this.id);
    });

    this.userDetails.getFacultyDetails(this.id).subscribe(
      data => {
        console.log(data); //Gets all Faculty details --> Bind it to the template
      },
      error => {
        console.log(error);
      }
    );
  }
}
