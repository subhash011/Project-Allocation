import { Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { HttpHeaders, HttpClient } from "@angular/common/http";
@Injectable({
  providedIn: "root"
})
export class ProjectsService {
  public url: string;
  constructor(private http: HttpClient, private router: Router) {}
  getAllProjects() {
    this.url = "http://localhost:8080/project";
    return this.http.get(this.url);
  }
}
