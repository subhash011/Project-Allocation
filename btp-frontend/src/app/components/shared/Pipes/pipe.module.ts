import { NgModule } from "@angular/core";
import { AdminCheck, FacultyCheck, StudentCheck, SuperAdminCheck } from "src/app/components/shared/Pipes/rolePipes";
import { CheckLogIn, CheckRegister, CountDown, GetLinksForNavBar, GetRegisteredCount, UserPhoto } from "./otherPipes";

@NgModule({
    imports: [],
    declarations: [
        AdminCheck,
        FacultyCheck,
        StudentCheck,
        SuperAdminCheck,
        GetLinksForNavBar,
        CheckRegister,
        CheckLogIn,
        GetRegisteredCount,
        CountDown,
        UserPhoto
    ],
    exports: [
        AdminCheck,
        FacultyCheck,
        StudentCheck,
        SuperAdminCheck,
        GetLinksForNavBar,
        CheckRegister,
        CheckLogIn,
        GetRegisteredCount,
        CountDown,
        UserPhoto
    ]
})
export class PipeModule {}
