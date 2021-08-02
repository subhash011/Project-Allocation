import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const role = localStorage.getItem('role') === 'admin' ? 'faculty' : localStorage.getItem('role');
const id = localStorage.getItem('id');
const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('src/app/components/home/home.module').then(m => m.HomeModule)
    },
    {
        path: 'student',
        loadChildren: () => import('src/app/components/student/student.module').then(m => m.StudentModule)
    },
    {
        path: 'faculty',
        loadChildren: () => import('src/app/components/faculty/faculty.module').then(m => m.FacultyModule)
    },
    {
        path: 'admin',
        loadChildren: () => import('src/app/components/admin/admin.module').then(m => m.AdminModule)
    },
    {
        path: 'super_admin',
        loadChildren: () => import('src/app/components/super-admin/super-admin.module').then(m => m.SuperAdminModule)
    },
    {
        path: '**',
        redirectTo: `${role}/${id}`
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            onSameUrlNavigation: 'reload',
            relativeLinkResolution: 'legacy',
            preloadingStrategy: PreloadAllModules
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
