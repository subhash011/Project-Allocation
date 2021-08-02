import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from 'src/environments/environment';
import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ExporttocsvService {
    private url: string;
    private root = environment.apiUrl;
    private baseUrl = this.root;

    constructor(private http: HttpClient) {
    }

    getCredentials() {
        return {
            id: localStorage.getItem('id'),
            idToken: localStorage.getItem('idToken')
        };
    }

    generateCSV_projects() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/export_projects/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    generateCSV_students() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/export_students/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    download(role) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/download_csv/' + id + '/' + role;
        const headers = new HttpHeaders({
            Authorization: idToken
        });
        return this.http.get(this.url, {
            headers,
            responseType: 'blob'
        });
    }

    uploadStudentList(fileToUpload: File, programName) {
        const {id, idToken} = this.getCredentials();
        const httpOptions = {
            headers: new HttpHeaders({
                enctype: 'multipart/form-data',
                Authorization: idToken
            })
        };
        this.url = this.baseUrl + 'admin/uploadStudentList/' + id;
        const formData: FormData = new FormData();
        formData.append('student_list', fileToUpload, programName);
        return this.http.post(this.url, formData, httpOptions);
    }
}
