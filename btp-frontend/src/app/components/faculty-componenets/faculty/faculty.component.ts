import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "src/app/services/user/user.service";

@Component({
  selector: "app-faculty",
  templateUrl: "./faculty.component.html",
  styleUrls: ["./faculty.component.scss"]
})
export class FacultyComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private userDetails: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    //   this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
    //     this.id = params.get("id");
    //     console.log(this.id);
    //   });
    //   this.userDetails.getFacultyDetails(this.id).subscribe(
    //     data => {
    //       console.log(data); //Gets all Faculty details --> Bind it to the template
    //     },
    //     error => {
    //       console.log(error);
    //     }
    //   );
  }
}
