import { Router } from "@angular/router";
import { SocialUser } from "angularx-social-login";
import { Injectable } from "@angular/core";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class UserService {
  public url: string;
  constructor(private http: HttpClient, private router: Router) {}
  getStudentDetails(id: String) {
    const user = JSON.parse(localStorage.getItem("user"));
    this.url = "http://localhost:8080/student/details/" + id;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: user.idToken
      })
    };
    return this.http.get(this.url, httpOptions);
  }

  getDetailsById(id: String) {
    const user = JSON.parse(localStorage.getItem("user"));
    this.url = "http://localhost:8080/auth/details/" + id;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: user.idToken
      })
    };
    return this.http.get(this.url, httpOptions);
  }

  getFacultyDetails(id: String) {
    const user = JSON.parse(localStorage.getItem("user"));
    this.url = "http://localhost:8080/faculty/details/" + id;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: user.idToken
      })
    };

    return this.http.get(this.url, httpOptions);
  }

  registerUser(user, httpOptions, position, id): string {
    this.http
      .post(
        "http://localhost:8080/" + position + "/register/" + id,
        user,
        httpOptions
      )
      .toPromise()
      .then((data: any) => {
        if (data["registration"] == "success") {
          var route = "/" + position + "/" + id;
          this.router.navigate([route]);
        } else {
          return "fail";
        }
      });
    return "";
  }
}
