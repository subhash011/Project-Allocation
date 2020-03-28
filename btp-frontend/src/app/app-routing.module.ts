import { StudentProjectsComponent } from "./components/student-components/student-projects/student-projects.component";
import { ProfileComponent } from "./components/shared/profile/profile.component";
import { DragDropComponent } from "./components/student-components/drag-drop/drag-drop.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./components/shared/login/login.component";
import { FacultyComponent } from "./components/faculty-componenets/faculty/faculty.component";
import { StudentComponent } from "./components/student-components/student/student.component";
import { RegisterComponent } from "./components/shared/register/register.component";
import { HomeComponent } from "./components/home/home.component";
import { ContentComponent } from "./components/faculty-componenets/content/content.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "register/:id", component: RegisterComponent },
  { path: "student/:id", component: StudentComponent },
  { path: "faculty/:id", component: FacultyComponent },
  { path: "student/preferences/:id", component: DragDropComponent },
  { path: "profile/:id", component: ProfileComponent },
  { path: "student/projects/:id", component: StudentProjectsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
