import { HelpComponent } from "src/app/components/shared/help/help.component";
import { AdminComponent } from "src/app/components/faculty-components/admin/admin.component";
import { SuperAdminComponent } from "src/app/components/shared/super-admin/super-admin.component";
import { RefreshComponent } from "src/app/components/faculty-components/refresh/refresh.component";
import { ProfileComponent } from "src/app/components/shared/profile/profile.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FacultyComponent } from "src/app/components/faculty-components/faculty/faculty.component";
import { StudentComponent } from "src/app/components/student-components/student/student.component";
import { RegisterComponent } from "src/app/components/shared/register/register.component";
import { HomeComponent } from "src/app/components/home/home.component";
import { ShowAvailableProjectsComponent } from "src/app/components/student-components/show-available-projects/show-available-projects.component";

const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "register/:id", component: RegisterComponent},
    {path: "student/:id", component: StudentComponent},
    {
        path: "faculty/:id", component: FacultyComponent, runGuardsAndResolvers: "always"
    },
    {
        path: "refresh", component: RefreshComponent
    },
    {
        path: "student/projects/:id", component: ShowAvailableProjectsComponent
    },
    {
        path: "student/preferences/:id", component: ShowAvailableProjectsComponent
    },
    {path: "profile/:id", component: ProfileComponent},
    {path: "super", component: SuperAdminComponent},
    {path: "admin/:id", component: AdminComponent},
    {path: "super_admin/:id", component: SuperAdminComponent},
    {path: "help", component: HelpComponent}
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            onSameUrlNavigation: "reload", relativeLinkResolution: "legacy"
        })
    ], exports: [ RouterModule ]
})
export class AppRoutingModule {}
