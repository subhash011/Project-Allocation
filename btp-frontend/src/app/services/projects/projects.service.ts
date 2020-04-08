import { Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { HttpHeaders, HttpClient } from "@angular/common/http";
@Injectable({
  providedIn: "root",
})
export class ProjectsService {
  private url: string;
  private url_pref: string;
  private url_post: string;
  private studentBaseURL = "http://localhost:8080/student/project/";
  private facultyBaseURL = "http://localhost:8080/faculty/project/";
  private adminBaseURL = "http://localhost:8080/admin/project/";
  constructor(private http: HttpClient, private router: Router) {}
  getAllStudentProjects() {
    const id = localStorage.getItem("id");
    this.url = this.studentBaseURL + id;
    const user = JSON.parse(localStorage.getItem("user"));
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: user.idToken,
      }),
    };
    return this.http.get(this.url, httpOptions);
  }
  getStudentPreference() {
    const id = localStorage.getItem("id");
    this.url_pref = this.studentBaseURL + "preference/" + id;
    const user = JSON.parse(localStorage.getItem("user"));
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: user.idToken,
      }),
    };
    return this.http.get(this.url_pref, httpOptions);
  }
  storeStudentPreferences(preferences) {
    const id = localStorage.getItem("id");
    this.url_post = this.studentBaseURL + "preference/" + id;
    const user = JSON.parse(localStorage.getItem("user"));
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: user.idToken,
      }),
    };
    return this.http.post(this.url_post, preferences, httpOptions);
  }
  getFacultyProjects() {
    let id = localStorage.getItem("id");
    let idToken = JSON.parse(localStorage.getItem("user")).idToken;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: idToken,
      }),
    };

    this.url = this.facultyBaseURL + id;
    return this.http.get(this.url, httpOptions);
  }

  saveProject(project) {
    let id = localStorage.getItem("id");
    let idToken = JSON.parse(localStorage.getItem("user")).idToken;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: idToken,
      }),
    };

    this.url = this.facultyBaseURL + "add/" + id;

    return this.http.post(this.url, project, httpOptions);
  }

  getStudentsApplied(students_id) {
    const student_data = {
      student: students_id,
    };
    let id = localStorage.getItem("id");
    let idToken = JSON.parse(localStorage.getItem("user")).idToken;

    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: idToken,
      }),
    };

    this.url = this.facultyBaseURL + "applied/" + id;

    return this.http.post(this.url, student_data, httpOptions);
  }

  savePreference(student_order, project_id) {
    const student_data = {
      student: student_order,
      project_id: project_id,
    };

    let id = localStorage.getItem("id");
    let idToken = JSON.parse(localStorage.getItem("user")).idToken;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: idToken,
      }),
    };

    this.url = this.facultyBaseURL + "save_preference/" + id;

    return this.http.post(this.url, student_data, httpOptions);
  }

  updateProject(project) {
    this.url = this.facultyBaseURL + "update/" + project.project_id;

    return this.http.post(this.url, project);
  }

  deleteProject(project_id) {
    this.url = this.facultyBaseURL + "delete/" + project_id;
    return this.http.delete(this.url);
  }

  getAllStreamProjects() {
    this.url = this.adminBaseURL + localStorage.getItem("id");
    console.log(this.url)
    const idToken = JSON.parse(localStorage.getItem("user")).idToken;
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: idToken,
      }),
    };
    return this.http.get(this.url, httpOptions);
  }

  startAllocation(){

    



  }


}
