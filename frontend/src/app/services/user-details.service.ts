import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class UserDetailsService {
  private _url: String;
  constructor(private http: HttpClient) {}

  getStudentDetails(id) {
    this._url = "http://localhost:8080/student/details/" + id;

    return this.http.get(this._url);
  }
}
