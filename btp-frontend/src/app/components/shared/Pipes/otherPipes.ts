import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "getRegisteredCount"
})
export class GetRegisteredCount implements PipeTransform {
    transform(students) {
        let registered = 0;
        let total = 0;
        students.forEach((student) => {
            total++;
            registered += student.isRegistered ? 1 : 0;
        });
        return registered;
    }
}
