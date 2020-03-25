import { SocialUser } from "angularx-social-login";
import { Injectable } from "@angular/core";
import { HttpHeaders, HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class UserService {
  public isLoggedIn: boolean;
  public url: string;
  public token: any;
  public role: String;
  public user: SocialUser;
  constructor(private http: HttpClient) {}
  getStudentDetails(id: String) {
    this.url = "http://localhost:8080/student/details/" + id;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: this.token
      })
    };
    this.token = localStorage.getItem("token");
    return this.http.get(this.url, httpOptions);
  }

  getDetailsById(id: String) {
    this.url = "http://localhost:8080/auth/details/" + id;
    this.token = localStorage.getItem("token");
    // console.log(this.token);
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: this.token
      })
    };
    return this.http.get(this.url, httpOptions);
  }

  getFacultyDetails(id: String) {
    this.url = "http://localhost:8080/faculty/details/" + id;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: this.token
      })
    };
    this.token = localStorage.getItem("token");
    return this.http.get(this.url, httpOptions);
  }
}
