import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ExporttocsvService {
  constructor(private http: HttpClient) {}
  private url: string;
  private root = environment.apiUrl;
  private base_url = this.root;

  generateCSV_projects() {
    const user = JSON.parse(localStorage.getItem("user"));
    const id = user.id;
    const idToken = user.idToken;
    this.url = this.base_url + "admin/export_projects/" + id;

    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: idToken,
      }),
    };
    return this.http.get(this.url, httpOptions);
  }

  generateCSV_students() {
    const user = JSON.parse(localStorage.getItem("user"));
    const id = user.id;
    const idToken = user.idToken;
    this.url = this.base_url + "admin/export_students/" + id;

    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: idToken,
      }),
    };
    return this.http.get(this.url, httpOptions);
  }

  download(role) {
    const user = JSON.parse(localStorage.getItem("user"));
    const id = user.id;
    const idToken = user.idToken;

    this.url = this.base_url + "admin/download_csv/" + id + "/" + role;
    const headers = new HttpHeaders({
      Authorization: idToken,
    });
    return this.http.get(this.url, { headers, responseType: "blob" });
  }

  uploadStudentList(fileToUpload: File, programName) {
    const user = JSON.parse(localStorage.getItem("user"));
    const id = user.id;
    const idToken = user.idToken;

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: idToken,
        "enc-type": "multipart/form-data",
      }),
    };

    this.url = this.base_url + "admin/uploadStudentList/" + id;
    const formData: FormData = new FormData();
    formData.append("student_list", fileToUpload, programName);
    return this.http.post(this.url, formData, httpOptions);
  }
}
