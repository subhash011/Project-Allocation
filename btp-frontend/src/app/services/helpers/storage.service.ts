import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private storageSub = new Subject<String>();

    watchStorage(): Observable<any> {
        return this.storageSub.asObservable();
    }

    setItem(key: string, data: any) {
        localStorage.setItem(key, data);
        this.storageSub.next(key);
    }

    getItem(key: string) {
        return localStorage.getItem(key);
    }

    clear() {
        localStorage.clear();
    }

    removeItem(key) {
        localStorage.removeItem(key);
    }
}
