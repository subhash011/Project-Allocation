import { SocialUser } from "angularx-social-login";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class UserService {
  public isLoggedIn: boolean;
  public role: String;
  public user: SocialUser;
  constructor() {}
}
