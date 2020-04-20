import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  theme: string;
  constructor(private httpClient: HttpClient, private router: Router) {}
  style;
  color = "red";
  ngOnInit(parameter = true) {
    if (localStorage.getItem("isLoggedIn") == "true" && parameter) {
      var position = localStorage.getItem("role");
      if (position == "admin") {
        position = "faculty";
      }
      this.router.navigate([position + "/" + localStorage.getItem("id")]);
    }
    this.theme = localStorage.getItem("current-theme");
    if (this.theme == "pink-grey") {
      this.color = "#e91e63";
    } else if (this.theme == "indigo-pink") {
      this.color = "#3f51b5";
    } else if (this.theme == "purple-green") {
      this.color = "#9c27b0";
    }
    // this.onComplete();
  }
  onComplete() {
    this.style = {
      background: "linear-gradient(125deg, white 25%," + this.color + " 25%)",
    };
  }
}
