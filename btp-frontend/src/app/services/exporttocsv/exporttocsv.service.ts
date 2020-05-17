import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExporttocsvService {

  constructor(
    private http : HttpClient
  ) { }
  private url: string;
  private root = environment.apiUrl;
  private base_url = this.root;

  generateCSV_projects(){

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
   return this.http.get(this.url ,httpOptions);

    // var fs = require("fs");


    // let headers = 'Title,Faculty,StudentIntake,PreferencesCount,';


    // const s_length = data[0].students_id.length;

    // for(let ind = 1;ind <= s_length;ind++){
    //   headers += (ind == s_length) ? `Preference.${ind}\n`:`Preference.${ind},`;
    // }

    // let str = "";
    // for(const fields of data){
    //   str += fields.title + "," + fields.faculty + "," + fields.studentIntake + "," + fields.preferenceCount + "," + fields.studentPref + "\n";
    // }

    // const write_obj = headers + str;

    // fs.writeFile(`${program_name}.csv`, write_obj, (err) => {
    //   if (err) console.log("Failed to write");
    //   console.log("Successfully Written to File.");
    // });


  }





}
