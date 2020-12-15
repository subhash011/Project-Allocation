import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'isFaculty'
})
export class FacultyCheck implements PipeTransform {
    transform(value) {
        return value == 'faculty';
    }
}

@Pipe({
    name: 'isAdmin'
})
export class AdminCheck implements PipeTransform {
    transform(value) {
        return value == 'admin';
    }
}

@Pipe({
    name: 'isStudent'
})
export class StudentCheck implements PipeTransform {
    transform(value) {
        return value == 'student';
    }
}

@Pipe({
    name: 'isSuper'
})
export class SuperAdminCheck implements PipeTransform {
    transform(value) {
        return value == 'super_admin';
    }
}
