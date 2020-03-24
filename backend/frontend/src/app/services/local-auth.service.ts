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
}
