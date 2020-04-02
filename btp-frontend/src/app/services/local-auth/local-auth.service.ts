import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class LocalAuthService {
  private user_url = "http://localhost:8080/auth/user_check";

  constructor(private http: HttpClient) {}

  checkUser(user) {
    return this.http.post<any>(this.user_url, user);
  }

  validate(data) {
    if (data.isRegistered) {
      if (data.position === "student")
        return {
          route: "/student/" + data.user_details.id,
          error: "none"
        };
      else if (data.position == "faculty" || data.position == "admin") {
        return {
          route: "/faculty/" + data.user_details.id,
          error: "none"
        };
      } else if (data.position == "super_admin") {
        return {
          route: "/super_admin/" + data.user_details.id,
          error: "none"
        };
      }
    } else if (!data.isRegistered) {
      if (data.position === "student") {
        return {
          route: "/register/" + data.user_details.id,
          error: "none"
        };
      } else if (data.position === "faculty") {
        return {
          route: "/register/" + data.user_details.id,
          error: "none"
        };
      } else if (data.position == "super_admin") {
        return {
          route: "/register/" + data.user_details.id,
          error: "none"
        };
      } else if (data.position === "error") {
        return {
          route: "/error",
          error: {
            msg: "Invalid Email",
            status: 401
          }
        };
      } else if (data.position === "login-error") {
        return {
          route: "/error",
          error: {
            msg: "Please Login Again",
            status: 400
          }
        };
      }
    }
  }
}
