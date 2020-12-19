import { HelpComponent } from "src/app/components/shared/help/help.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RegisterComponent } from "src/app/components/shared/register/register.component";

const routes: Routes = [
    {
        path: "",
        loadChildren: () => import("src/app/components/home/home.module").then(m => m.HomeModule)
    },
    {
        path: "register/:id",
        component: RegisterComponent
    },
    {
        path: "student",
        loadChildren: () => import("src/app/components/student/student.module").then(m => m.StudentModule)
    },
    {
        path: "faculty",
        loadChildren: () => import("src/app/components/faculty/faculty.module").then(m => m.FacultyModule)
    },
    {
        path: "admin",
        loadChildren: () => import("src/app/components/admin/admin.module").then(m => m.AdminModule)
    },
    {
        path: "super_admin",
        loadChildren: () => import("src/app/components/super-admin/super-admin.module").then(m => m.SuperAdminModule)
    },
    {
        path: "help",
        component: HelpComponent
    },
    {
        path: "**",
        redirectTo: ""
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            onSameUrlNavigation: "reload",
            relativeLinkResolution: "legacy"
        })
    ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
