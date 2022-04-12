import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MailService {
    private root = environment.apiUrl;
    private baseUrl = this.root + 'email/';
    private apiUrl = this.root.replace('api/', '');

    constructor(private http: HttpClient) {
    }

    allocateMail(mails, program) {
        const idToken = localStorage.getItem('idToken');
        const name = localStorage.getItem('name');
        const url = this.baseUrl + 'send';
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        const body = {
            mailBody: `Dear Students and Faculty Members,

The project allocation for program ${program} has been completed. Please login to the project allocation portal to view the projects/students allocated to you.

The URL for the project allocation portal is : ${this.apiUrl}.

THIS IS A SYSTEM GENERATED E-MAIL. PLEASE DO NOT REPLY TO THIS EMAIL. IF THERE ARE ANY ISSUES/CONCERNS PLEASE CONTACT THE PROGRAM COORDINATOR.

Regards,
${name},
Project Coordinator (${program})
 `,
            to: mails,
            subject: `${program}: Project Allocation Completed`
        };
        return this.http.post(url, body, httpOptions);
    }

    adminToFaculty(stage, emails, curDeadline, stream) {
        const fmt1 = new Intl.DateTimeFormat('en-GB', {
            year: '2-digit',
            month: 'numeric',
            day: 'numeric'
        });
        const idToken = localStorage.getItem('idToken');
        const name = localStorage.getItem('name');
        const url = this.baseUrl + 'send';
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        let body: { mailBody: string; subject: string; to: any };
        if (stage === 0) {
            body = {
                mailBody: `Dear Faculty Members,

Please login to the project allocation portal and add projects that you would like to offer to students of program ${stream}. Note that the deadline for this phase is ${fmt1.format(
                    curDeadline) + ' 11:59 pm'}.

The URL for the project allocation portal is : ${this.apiUrl}.

THIS IS A SYSTEM GENERATED E-MAIL. PLEASE DO NOT REPLY TO THIS EMAIL. IF THERE ARE ANY ISSUES/CONCERNS PLEASE CONTACT THE PROGRAM COORDINATOR.

Regards,
${name},
Project Coordinator (${stream})
`,
                to: emails,
                subject: `${stream}: Project Allocation Phase 1`
            };
        } else if (stage === 2) {
            body = {
                mailBody: `Dear Faculty Members,

Please login to the project allocation portal and record your preference among students. Note that the default order of preference is the decreasing order of CGPA. Also, make sure to indicate the final set of projects that you would like to offer and note that by default all your projects are included. The deadline for this phase is ${fmt1.format(
                    curDeadline) + ' 11:59 pm'}.

The URL for the project allocation portal is : ${this.apiUrl}.

THIS IS A SYSTEM GENERATED E-MAIL. PLEASE DO NOT REPLY TO THIS EMAIL. IF THERE ARE ANY ISSUES/CONCERNS PLEASE CONTACT THE PROGRAM COORDINATOR.

Regards,
${name},
Project Coordinator (${stream})
`,
                to: emails,
                subject: `${stream}: Project Allocation Phase 3`
            };
        }
        return this.http.post(url, body, httpOptions);
    }

    adminToStudents(emails, curDeadline, stream) {
        const fmt1 = new Intl.DateTimeFormat('en-GB', {
            year: '2-digit',
            month: 'numeric',
            day: 'numeric'
        });
        const idToken = localStorage.getItem('idToken');
        const name = localStorage.getItem('name');
        const url = this.baseUrl + 'send';
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        const body = {
            mailBody: `Dear Students,

Please login to the project allocation portal and record your preference among projects offered to program ${stream}. Note that it is better to have as many projects as possible in your preference list. The deadline for this phase is ${fmt1.format(
                curDeadline) + ' 11:59 pm'}.

The URL for the project allocation portal is : ${this.apiUrl}.

THIS IS A SYSTEM GENERATED E-MAIL. PLEASE DO NOT REPLY TO THIS EMAIL. IF THERE ARE ANY ISSUES/CONCERNS PLEASE CONTACT THE PROGRAM COORDINATOR.

Regards,
${name},
Project Coordinator (${stream})
    `,
            to: emails,
            subject: `${stream}: Project Allocation Phase 2`
        };
        return this.http.post(url, body, httpOptions);
    }

    publishMail(role, emails, program) {
        const idToken = localStorage.getItem('idToken');
        const name = localStorage.getItem('name');
        const url = this.baseUrl + 'send';
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        let body: { mailBody: string; subject: string; to: any };
        if (role === 'student') {
            body = {
                mailBody: `Dear Students,

The project allocation for program ${program} has been completed. Please login to the project allocation portal to view the projects/students allocated to you.

The URL for the project allocation portal is : ${this.apiUrl}.

THIS IS A SYSTEM GENERATED E-MAIL. PLEASE DO NOT REPLY TO THIS EMAIL. IF THERE ARE ANY ISSUES/CONCERNS PLEASE CONTACT THE PROGRAM COORDINATOR.

Regards,
${name},
Project Coordinator (${program})
         `,
                to: emails,
                subject: `${program}: Project Allocation Completed`
            };
        } else if (role === 'faculty') {
            body = {
                mailBody: `Dear Faculty Members,

The project allocation for program ${program} has been completed. Please login to the project allocation portal to view the projects/students allocated to you.

The URL for the project allocation portal is : ${this.apiUrl}.

THIS IS A SYSTEM GENERATED E-MAIL. PLEASE DO NOT REPLY TO THIS EMAIL. IF THERE ARE ANY ISSUES/CONCERNS PLEASE CONTACT THE PROGRAM COORDINATOR.

Regards,
${name},
Project Coordinator (${program})
         `,
                to: emails,
                subject: `${program}: Project Allocation Completed`
            };
        }
        return this.http.post(url, body, httpOptions);
    }
}
