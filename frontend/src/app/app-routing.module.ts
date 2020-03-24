import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import {HomeComponent} from './components/home/home.component'
import { StudentComponent } from './components/student/student.component';
import { FacultyComponent } from './components/faculty/faculty.component';

const routes: Routes = [
  {path:'',component:HomeComponent},
  {path:'student/:id',component:StudentComponent},
  {path:'faculty/:id',component:FacultyComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
