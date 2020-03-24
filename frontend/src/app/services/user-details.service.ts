import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class UserDetailsService {
  private url: string;
  private token;
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

  registerUser(position, id/*, formData*/) {
    this.url = "http://localhost:8080/" + position + "/register/" + id;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: this.token
      })
    };
    this.token = localStorage.getItem("token");
    return this.http.post<any>(this.url/*,formData*/ ,httpOptions);
  }
}
