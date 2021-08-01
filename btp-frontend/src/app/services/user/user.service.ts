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

    addAdmin(id, branch) {
        const user = JSON.parse(localStorage.getItem('user'));
        this.url = this.baseUrl + 'super/addAdmin/' + user.id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: user.idToken
            })
        };
        return this.http.post(this.url, {
            id,
            branch
        }, httpOptions);
    }

    removeFaculty(id) {
        const user = JSON.parse(localStorage.getItem('user'));
        this.url = this.baseUrl + 'super/faculty/' + user.id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: user.idToken,
                body: id
            })
        };
        return this.http.delete(this.url, httpOptions);
    }

    removeStudent(id) {
        const user = JSON.parse(localStorage.getItem('user'));
        this.url = this.baseUrl + 'super/student/' + user.id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: user.idToken,
                body: id
            })
        };
        return this.http.delete(this.url, httpOptions);
    }

    removeAdmin(id) {
        const user = JSON.parse(localStorage.getItem('user'));
        this.url = this.baseUrl + 'super/removeAdmin/' + user.id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: user.idToken
            })
        };
        return this.http.post(this.url, {id}, httpOptions);
    }

    getAllStudents() {
        const user = JSON.parse(localStorage.getItem('user'));
        this.url = this.baseUrl + 'super/student/details/' + user.id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: user.idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    getAllFaculties() {
        const user = JSON.parse(localStorage.getItem('user'));
        this.url = this.baseUrl + 'super/faculty/details/' + user.id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: user.idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    getStudentDetails(id) {
        const user = JSON.parse(localStorage.getItem('user'));
        this.url = this.baseUrl + 'student/details/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: user.idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    getFacultyDetails(id) {
        const user = JSON.parse(localStorage.getItem('user'));
        this.url = this.baseUrl + 'faculty/details/' + id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: user.idToken
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
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        // TODO Why is moment needed here ?
        const obj = {
            deadline: date
            // deadline: moment(date).format("YYYY-MM-DD")
        };
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        this.url = this.baseUrl + 'student/stage/' + localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    getAllProjects() {
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        const id = localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        this.url = this.baseUrl + 'branches/' + localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, details, httpOptions);
    }

    removeStream(map) {
        this.url = this.baseUrl + 'branches/remove/' + localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        this.url = this.baseUrl + 'maps/' + localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.post(this.url, map, httpOptions);
    }

    removeProgram(map) {
        this.url = this.baseUrl + 'maps/remove/' + localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
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
        this.url = this.baseUrl + 'admin/members/' + localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    removeFacultyAdmin(id) {
        this.url = this.baseUrl + 'admin/faculty/' + localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken,
                body: id
            })
        };
        return this.http.delete(this.url, httpOptions);
    }

    removeStudentAdmin(id) {
        this.url = this.baseUrl + 'admin/student/' + localStorage.getItem('id');
        const idToken = JSON.parse(localStorage.getItem('user')).idToken;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: idToken,
                body: id
            })
        };
        return this.http.delete(this.url, httpOptions);
    }

    getAllBranches() {
        return this.http.get(this.baseUrl + 'branches');
    }

    fetchAllMails() {
        const user = JSON.parse(localStorage.getItem('user'));
        const id = user.id;
        const idToken = user.idToken;
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
        const user = JSON.parse(localStorage.getItem('user'));
        const id = user.id;
        const idToken = user.idToken;
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
        const user = JSON.parse(localStorage.getItem('user'));
        const id = user.id;
        const idToken = user.idToken;
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
        const user = JSON.parse(localStorage.getItem('user'));
        const id = user.id;
        const idToken = user.idToken;
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
        const user = JSON.parse(localStorage.getItem('user'));
        const id = user.id;
        const idToken = user.idToken;
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
        const user = JSON.parse(localStorage.getItem('user'));
        const id = user.id;
        const idToken = user.idToken;
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
        const user = JSON.parse(localStorage.getItem('user'));
        this.url = this.baseUrl + 'faculty/home/' + user.id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: user.idToken
            })
        };
        return this.http.get(this.url, httpOptions);
    }

    updateProgram(curMap, newMap) {
        const user = JSON.parse(localStorage.getItem('user'));
        this.url = this.baseUrl + 'super/update/program/' + user.id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: user.idToken
            })
        };
        return this.http.post(this.url, {
            curMap,
            newMap
        }, httpOptions);
    }

    updateStream(curMap, newMap) {
        const user = JSON.parse(localStorage.getItem('user'));
        this.url = this.baseUrl + 'super/update/stream/' + user.id;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: user.idToken
            })
        };
        return this.http.post(this.url, {
            curMap,
            newMap
        }, httpOptions);
    }

    // updateList(stream) {
    //     this.url = this.baseUrl + 'admin/updateLists/' + localStorage.getItem('id');
    //     const idToken = JSON.parse(localStorage.getItem('user')).idToken;
    //     const httpOptions = {
    //         headers: new HttpHeaders({
    //             'Content-Type': 'application/json',
    //             Authorization: idToken,
    //         }),
    //     };
    //     return this.http.post(this.url, {stream: stream}, httpOptions);
    // }
}
