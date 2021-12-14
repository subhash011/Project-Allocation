import {environment} from 'src/environments/environment';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

// import * as moment from "moment";
@Injectable({
    providedIn: 'root'
})
export class UserService {
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

    addAdmin(facultyId, branch) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'super/addAdmin/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, {
            facultyId,
            branch
        }, httpOptions);
    }

    removeFaculty(facultyId) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'super/faculty/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken,
                body: facultyId
            })
        };
        return this.http.delete(this.url, httpOptions);
    }

    removeStudent(studentId) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'super/student/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken,
                body: studentId
            })
        };
        return this.http.delete(this.url, httpOptions);
    }

    removeAdmin(adminId) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'super/removeAdmin/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, {adminId}, httpOptions);
    }

    getAllStudents() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'super/student/details/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    getAllFaculties() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'super/faculty/details/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    getStudentDetails(id) {
        const {idToken} = this.getCredentials();
        this.url = this.baseUrl + 'student/details/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    getFacultyDetails(facultyId) {
        const {idToken} = this.getCredentials();
        this.url = this.baseUrl + 'faculty/details/' + facultyId;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    registerUser(user, httpOptions, position, id) {
        if (position === 'super_admin') {
            position = 'super';
        }
        return this.http.post(this.baseUrl + position + '/register/' + id, user, httpOptions);
    }

    getAdminInfo() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/info/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    updateStage(stage) {
        const obj = {
            stage
        };
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/update_stage/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, obj, httpOptions);
    }

    setDeadline(date) {
        const obj = {
            deadline: date
        };
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/setDeadline/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, obj, httpOptions);
    }

    uploadAllocationFile() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/export_allocation/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    getFacultyStreamEmails() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/stream_email/faculty/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    getStudentStreamEmails() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/stream_email/student/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken // change it later
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    getAllAdminDetails() {
        this.url = this.baseUrl + 'admin/all/info';
        return this.http.get(this.url);
    }

    getStreamStage() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'student/stage/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    getAllProjects() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'super/projects/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    setProjectCap(cap) {
        const obj = {
            cap
        };
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/set_projectCap/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, obj, httpOptions);
    }

    setStudentCap(cap) {
        const obj = {
            cap
        };
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/set_studentCap/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, obj, httpOptions);
    }

    setStudentsPerFaculty(cap) {
        const obj = {
            cap
        };
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/set_studentsPerFaculty/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, obj, httpOptions);
    }

    setPrograms(programs) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'faculty/set_programs/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, programs, httpOptions);
    }

    updateFacultyProfile(faculty) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'faculty/updateProfile/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, faculty, httpOptions);
    }

    getAllPrograms() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'faculty/getAllPrograms/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    deleteFacultyProgram(program) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'faculty/deleteProgram/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, program, httpOptions);
    }

    getFacultyPrograms() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'faculty/getFacultyPrograms/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    getAdminInfo_program(program) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'faculty/getAdminInfo_program/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, {program}, httpOptions);
    }

    getAllMaps() {
        return this.http.get(this.baseUrl + 'maps');
    }

    addStream(details) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'branches/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, details, httpOptions);
    }

    removeStream(map) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'branches/remove/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken,
                body: JSON.stringify(map)
            })
        };
        return this.http.delete(this.url, httpOptions);
    }

    addProgram(map) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'maps/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, map, httpOptions);
    }

    removeProgram(map) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'maps/remove/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken,
                body: JSON.stringify(map)
            })
        };
        return this.http.delete(this.url, httpOptions);
    }

    getMembersForAdmin() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/members/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    removeFacultyAdmin(facultyId) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/faculty/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken,
                body: facultyId
            })
        };
        return this.http.delete(this.url, httpOptions);
    }

    removeStudentAdmin(studentId) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/student/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken,
                body: studentId
            })
        };
        return this.http.delete(this.url, httpOptions);
    }

    getAllBranches() {
        return this.http.get(this.baseUrl + 'branches');
    }

    fetchAllMails() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/fetchAllMails/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    validateAllocation(projects, studentsEnrolled) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/validateAllocation/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, {
            projects,
            students: studentsEnrolled
        }, httpOptions);
    }

    revertStage(stageNo) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/revertStage/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, {stage: stageNo}, httpOptions);
    }

    resetUsers() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/reset/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, {message: 'hi'}, httpOptions);
    }

    updatePublish(key) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/updatePublish/' + id;
        const allocationMap = JSON.parse(localStorage.getItem('allocationMap'));
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, {
            mode: key,
            allocationMap
        }, httpOptions);
    }

    getPublishMode(key) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'admin/getPublish/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, {mode: key}, httpOptions);
    }

    facultyHomeDetails() {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'faculty/home/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    updateProgram(curMap, newMap) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'super/update/program/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, {
            curMap,
            newMap
        }, httpOptions);
    }

    updateStream(curMap, newMap) {
        const {id, idToken} = this.getCredentials();
        this.url = this.baseUrl + 'super/update/stream/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, {
            curMap,
            newMap
        }, httpOptions);
    }

    updateList(stream) {
        this.url = this.baseUrl + 'admin/updateLists/' + localStorage.getItem('id');
        const idToken = localStorage.getItem('idToken');
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken,
            }),
        };
        return this.http.post(this.url, {stream}, httpOptions);
    }
}
