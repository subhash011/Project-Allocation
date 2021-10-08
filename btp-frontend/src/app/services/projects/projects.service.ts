import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProjectsService {
    private url: string;
    private urlPref: string;
    private urlPost: string;
    private root = environment.apiUrl;
    private studentBaseURL = this.root + 'student/project/';
    private facultyBaseURL = this.root + 'faculty/project/';
    private adminBaseURL = this.root + 'admin/project/';

    constructor(private http: HttpClient) {
    }

    getCredentials() {
        return {
            id: localStorage.getItem('id'),
            idToken: localStorage.getItem('idToken')
        };
    }

    getStudentPreference() {
        const {id, idToken} = this.getCredentials();
        this.urlPref = this.studentBaseURL + 'preference/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.urlPref, httpOptions);
    }

    getNotStudentPreferences() {
        const {id, idToken} = this.getCredentials();
        this.urlPref = this.studentBaseURL + 'not_preference/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.urlPref, httpOptions);
    }

    storeStudentPreferences(preferences) {
        preferences = preferences.map((val) => {
            return {
                _id: val._id
            };
        });
        const {id, idToken} = this.getCredentials();
        this.urlPost = this.studentBaseURL + 'preference/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.urlPost, preferences, httpOptions);
    }

    appendStudentPreferences(preferences) {
        preferences = preferences.map((val) => val._id);
        const {id, idToken} = this.getCredentials();
        this.urlPost = this.studentBaseURL + 'append/preference/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.urlPost, preferences, httpOptions);
    }

    addOneStudentPreference(preference) {
        preference = preference._id;
        const {id, idToken} = this.getCredentials();
        this.urlPost = this.studentBaseURL + 'add/preference/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.urlPost, {preference}, httpOptions);
    }

    removeOneStudentPreference(preference) {
        preference = preference._id;
        const {id, idToken} = this.getCredentials();
        this.urlPost = this.studentBaseURL + 'remove/preference/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.urlPost, {preference}, httpOptions);
    }

    getFacultyProjects(program) {
        const {id, idToken} = this.getCredentials();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        this.url = this.facultyBaseURL + id;
        return this.http.post(this.url, {program}, httpOptions);
    }

    saveProject(project) {
        const {id, idToken} = this.getCredentials();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        this.url = this.facultyBaseURL + 'add/' + id;
        return this.http.post(this.url, project, httpOptions);
    }

    getStudentsApplied(projectId) {
        const {id, idToken} = this.getCredentials();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        this.url = this.facultyBaseURL + 'applied/' + id;
        return this.http.post(this.url, {project: projectId}, httpOptions);
    }

    savePreference(studentOrder, projectId, stream, index, reorder) {
        studentOrder = studentOrder.map((per) => {
            return per._id;
        });
        const studentData = {
            student: studentOrder,
            project_id: projectId,
            stream,
            index,
            reorder
        };
        const {id, idToken} = this.getCredentials();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        this.url = this.facultyBaseURL + 'save_preference/' + id;
        return this.http.post(this.url, studentData, httpOptions);
    }

    includeProjects(projects) {
        const {id, idToken} = this.getCredentials();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        this.url = this.facultyBaseURL + 'include_projects/' + id;
        return this.http.post(this.url, {projects}, httpOptions);
    }

    updateProject(project) {
        const {id, idToken} = this.getCredentials();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        this.url = this.facultyBaseURL + 'update/' + id;
        return this.http.post(this.url, {project}, httpOptions);
    }

    deleteProject(projectId) {
        const {id, idToken} = this.getCredentials();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken,
                body: projectId
            })
        };
        this.url = this.facultyBaseURL + 'delete/' + id;
        return this.http.delete(this.url, httpOptions);
    }

    deleteProjectAdmin(projectId) {
        const {id, idToken} = this.getCredentials();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken,
                body: projectId
            })
        };
        this.url = this.adminBaseURL + id;
        return this.http.delete(this.url, httpOptions);
    }

    getAllStreamProjects() {
        const {idToken} = this.getCredentials();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        this.url = this.adminBaseURL + localStorage.getItem('id');
        return this.http.get(this.url, httpOptions);
    }

    startAllocation(projects) {
        const {id, idToken} = this.getCredentials();
        this.url = this.root + 'allocation/start/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, {projects}, httpOptions);
    }
}
