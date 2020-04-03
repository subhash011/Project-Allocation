import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class MailService {
  constructor(private http: HttpClient) {}

  base_url = "http://localhost:8080/email/";

  testMethod() {
    const user = JSON.parse(localStorage.getItem("user"));
    var url = this.base_url + "send";
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: user.idToken
      })
    };
    const body = {
      user: user,
      mailBody: "this is the mail",
      to: ["111801042@smail.iitpkd.ac.in", "subhash011011@gmail.com"],
      subject: "this is the subject"
    };
    return this.http.post(url, body, httpOptions);
  }
}
