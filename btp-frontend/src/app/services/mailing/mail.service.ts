import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
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
        Authorization: user.idToken,
      }),
    };
    const body = {
      user: user,
      mailBody: "this is the mail",
      to: ["111801042@smail.iitpkd.ac.in", "subhash011011@gmail.com"],
      subject: "this is the subject",
    };
    return this.http.post(url, body, httpOptions);
  }

  adminToFaculty(stage, emails, curr_deadline, stream, remainder = false) {
    console.log(remainder);
    let fmt1 = new Intl.DateTimeFormat("en-GB", {
      year: "2-digit",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const user = JSON.parse(localStorage.getItem("user"));
    var url = this.base_url + "send";
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: user.idToken,
      }),
    };

    if (remainder) {
      var body = {
        user: user,
        mailBody: `Dear Faculty Member,
    A Gentle Remainder.

With Regards,
${user.name},
${stream} Admin
`,
        to: emails,
        subject: "Remainder",
      };
    } else {
      if (stage == 0) {
        var body = {
          user: user,
          mailBody: `Dear Faculty Member,
    I kindly request you to start creating projects for the 4th year BTech Projects. Please do note that the deadline is ${fmt1.format(
      curr_deadline
    )}.

With Regards,
${user.name},
${stream} Admin
  `,
          to: emails,
          subject: "BTech Project Phase 1",
        };
      } else if (stage == 2) {
        var body = {
          user: user,
          mailBody: `Dear Faculty Member,
I kindly request you to fill in your preference students for your projects. Please do note that the deadline is ${fmt1.format(
            curr_deadline
          )}.

With Regards,
${user.name},
${stream} Admin
  `,
          to: emails,
          subject: "BTech Project Phase 3",
        };
      }
    }
    return this.http.post(url, body, httpOptions);
  }

  adminToStudents(emails, curr_deadline, stream, remainder = false) {
    console.log(curr_deadline);
    let fmt1 = new Intl.DateTimeFormat("en-GB", {
      year: "2-digit",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const user = JSON.parse(localStorage.getItem("user"));
    var url = this.base_url + "send";
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: user.idToken,
      }),
    };

    if (remainder) {
      var body = {
        user: user,
        mailBody: `Dear Student,
    A Gentle Remainder.

With Regards,
${user.name},
${stream} Admin
`,
        to: emails,
        subject: "Remainder",
      };
    } else {
      var body = {
        user: user,
        mailBody: `Dear Students,
      I kindly request you to fill in your preferences of projects. Please do note that the deadline is ${fmt1.format(
        curr_deadline
      )}.

  With Regards,
  ${user.name},
  ${stream} Admin
  `,
        to: emails,
        subject: "BTech Project Phase 3",
      };
    }

    return this.http.post(url, body, httpOptions);
  }

  formatAMPM(curr_date) {
    const date = new Date(curr_date);
    var hours = date.getHours();
    var ampm = hours >= 12 ? "pm" : "am";
    return ampm;
  }
}
