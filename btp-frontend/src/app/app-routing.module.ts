import { HelpComponent } from "./components/shared/help/help.component";
import { AdminComponent } from "./components/faculty-componenets/admin/admin.component";
import { SuperAdminComponent } from "./components/shared/super-admin/super-admin.component";
import { RefreshComponent } from "./components/faculty-componenets/refresh/refresh.component";
import { StudentProjectsComponent } from "./components/student-components/student-projects/student-projects.component";
import { ProfileComponent } from "./components/shared/profile/profile.component";
// import { DragDropComponent } from "./components/student-components/drag-drop/drag-drop.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FacultyComponent } from "./components/faculty-componenets/faculty/faculty.component";
import { StudentComponent } from "./components/student-components/student/student.component";
import { RegisterComponent } from "./components/shared/register/register.component";
import { HomeComponent } from "./components/home/home.component";
import { ShowAvailableProjectsComponent } from "./components/student-components/show-available-projects/show-available-projects.component";
import { EditPreferencesComponent } from "./components/student-components/edit-preferences/edit-preferences.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "register/:id", component: RegisterComponent },
  { path: "student/:id", component: StudentComponent },
  {
    path: "faculty/:id",
    component: FacultyComponent,
    runGuardsAndResolvers: "always",
  },
  {
    path: "refresh",
    component: RefreshComponent,
  },
  {
    path: "student/projects/:id",
    component: ShowAvailableProjectsComponent,
  },
  {
    path: "student/preferences/:id",
    component: ShowAvailableProjectsComponent,
  },
  { path: "profile/:id", component: ProfileComponent },
  { path: "super", component: SuperAdminComponent },
  { path: "admin/:id", component: AdminComponent },
  { path: "super_admin/:id", component: SuperAdminComponent },
  { path: "help", component: HelpComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
