import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "getRegisteredCount"
})
export class GetRegisteredCount implements PipeTransform {
    transform(students) {
        let registered = 0;
        let total = 0;
        students.forEach((student) => {
            total++;
            registered += student.isRegistered ? 1 : 0;
        });
        return registered;
    }
}

@Pipe({
    name: "checkRegister"
})
export class CheckRegister implements PipeTransform {
    transform(value) {
        const role = localStorage.getItem("role");
        return (role == "faculty" || role == "admin" || role == "student" || role == "super_admin");
    }
}

@Pipe({
    name: "links"
})
export class GetLinksForNavBar implements PipeTransform {
    transform(value, role) {
        role = role == "admin" ? "faculty" : role;
        if (value == "profile") {
            return (role == "admin" ? "faculty" : role) + "/profile/" + localStorage.getItem("id");
        } else if (value == "home") {
            if (localStorage.getItem("role") == "admin") {
                return "faculty" + "/" + localStorage.getItem("id");
            } else {
                return role + "/" + localStorage.getItem("id");
            }
        } else if (value == "studentProjects") {
            return role + "/projects/" + localStorage.getItem("id");
        } else if (value == "studentPreferences") {
            return "student" + "/preferences/" + localStorage.getItem("id");
        } else if (value == "help") {
            return (role == "admin" ? "faculty" : role) + "/help/" + localStorage.getItem("id");
        }
    }
}

@Pipe({
    name: "checkLogIn",
    pure: false
})
export class CheckLogIn implements PipeTransform {
    transform(value) {
        return localStorage.getItem("isLoggedIn") == "true";
    }
}

@Pipe({
    name: "countdown"
})
export class CountDown implements PipeTransform {
    transform(value, now) {
        let str = "";
        const currentTime = now.getTime();
        const endTime = value.getTime();
        const distance = endTime - currentTime; // ms of difference
        let days, hrs, mins, seconds;
        if (distance > 0) {
            days = Math.floor(distance / (1000 * 60 * 60 * 24));
            hrs = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            str += days == 0 ? "" : days > 9 ? days + " days " : "0" + days + (days == 1 ? " day " : " days ");
            str += hrs == 0 ? "" : hrs > 9 ? hrs + " hours " : "0" + hrs + (hrs == 1 ? " hour " : " hours ");
            str += mins == 0 ? "" : mins > 9 ? mins + " minutes " : "0" + mins + (mins == 1 ? " minute " : " minutes ");
        } else {
            days = 0;
            hrs = 0;
            mins = 0;
        }
        if (days == 0 && hrs == 0 && mins == 0) {
            return "This stage has ended.";
        }
        return str;
    }
}

@Pipe({
    name: "userPhoto"
})
export class UserPhoto implements PipeTransform {
    transform(value) {
        const user = JSON.parse(localStorage.getItem("user"));
        return user["photoUrl"];
    }
}
