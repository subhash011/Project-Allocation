import { AdminComponent } from "./components/faculty-componenets/admin/admin.component";
import { SuperAdminComponent } from "./components/shared/super-admin/super-admin.component";
import { RefreshComponent } from "./components/faculty-componenets/refresh/refresh.component";
import { StudentProjectsComponent } from "./components/student-components/student-projects/student-projects.component";
import { ProfileComponent } from "./components/shared/profile/profile.component";
import { DragDropComponent } from "./components/student-components/drag-drop/drag-drop.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FacultyComponent } from "./components/faculty-componenets/faculty/faculty.component";
import { StudentComponent } from "./components/student-components/student/student.component";
import { RegisterComponent } from "./components/shared/register/register.component";
import { HomeComponent } from "./components/home/home.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "register/:id", component: RegisterComponent },
  { path: "student/:id", component: StudentComponent },
  {
    path: "faculty/:id",
    component: FacultyComponent,
    runGuardsAndResolvers: "always"
  },
  {
    path: "refresh",
    component: RefreshComponent
  },
  { path: "student/preferences/:id", component: DragDropComponent },
  { path: "profile/:id", component: ProfileComponent },
  { path: "student/projects/:id", component: StudentProjectsComponent },
  { path: "super", component: SuperAdminComponent },
  { path: "admin/:id", component: AdminComponent }
  { path: "super_admin/:id", component: SuperAdminComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
