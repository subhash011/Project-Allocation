import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class MailService {
  constructor(private http: HttpClient) {}
  private root = environment.apiUrl;
  base_url = this.root + "email/";

  allocateMail(mails, program) {
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
      mailBody: `Dear Students and Faculty Members,

The project allocation for program ${program} has been completed. Please login to the project allocation portal to view the projects/students allocated to you.

Regards,
${user.name},
Project Coordinator (${program})
 `,
      to: mails,
      subject: `${program}: Project Allocation Completed`,
    };
    return this.http.post(url, body, httpOptions);
  }

  adminToFaculty(stage, emails, curr_deadline, stream, remainder = false) {
    let fmt1 = new Intl.DateTimeFormat("en-GB", {
      year: "2-digit",
      month: "numeric",
      day: "numeric",
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
          mailBody: `Dear Faculty Members,

  Please login to the project allocation portal and add projects that you would like to offer to students of program ${stream}. Note that the deadline for this phase is ${
            fmt1.format(curr_deadline) + " 11:59 pm"
          }.

Regards,
${user.name},
Project Coordinator (${stream})
`,
          to: emails,
          subject: `${stream}: Project Allocation Phase 1`,
        };
      } else if (stage == 2) {
        var body = {
          user: user,
          mailBody: `Dear Faculty Members,

  Please login to the project allocation portal and record your preference among students who have opted to work with you. Note that the default order of preference is the decreasing order of CGPA. The deadline for this phase is ${
    fmt1.format(curr_deadline) + " 11:59 pm"
  }.

Regards,
${user.name},
Project Coordinator (${stream})
`,

          to: emails,
          subject: `${stream}: Project Allocation Phase 3`,
        };
      }
    }
    return this.http.post(url, body, httpOptions);
  }

  adminToStudents(emails, curr_deadline, stream, remainder = false) {
    let fmt1 = new Intl.DateTimeFormat("en-GB", {
      year: "2-digit",
      month: "numeric",
      day: "numeric",
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

    Please login to the project allocation portal and record your preference among projects offered to program ${stream}. Note that it is better to have as many projects as possible in your preference list. The deadline for this phase is ${
          fmt1.format(curr_deadline) + " 11:59 pm"
        }.

Regards,
${user.name},
Project Coordinator (${stream})
    `,
        to: emails,
        subject: `${stream}: Project Allocation Phase 2`,
      };
    }

    return this.http.post(url, body, httpOptions);
  }

  publishMail(role,emails,program){

    const user = JSON.parse(localStorage.getItem("user"));
    var url = this.base_url + "send";
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: user.idToken,
      }),
    };

    if(role == "student"){
      var body = {
        user: user,
        mailBody: `Dear Students,

The project allocation for program ${program} has been completed. Please login to the project allocation portal to view the projects/students allocated to you.
        
Regards,
${user.name},
Project Coordinator (${program})
         `,
        to: emails,
        subject: `${program}: Project Allocation Completed`,
      };


    }

    else if(role == "faculty"){
      var body = {
        user: user,
        mailBody: `Dear Faculty Members,

The project allocation for program ${program} has been completed. Please login to the project allocation portal to view the projects/students allocated to you.
        
Regards,
${user.name},
Project Coordinator (${program})
         `,
        to: emails,
        subject: `${program}: Project Allocation Completed`,
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
