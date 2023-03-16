import { Injectable } from "@angular/core";
import { invoke } from "@tauri-apps/api/tauri";
import { Subject } from "rxjs";
import { User } from "../models/interfaces";

@Injectable({
    providedIn: "root"
})
export class UserService {
    private user: User = {
        name: null,
        logged: false
    };
    userSubject = new Subject<User>();

    constructor() {}

    emitUser() {
        this.userSubject.next(this.user);
    }

    async start() {
        const name: string | null = await invoke("set_db");
        this.user.name = name;
        this.emitUser();
    }

    async signup(name: string, password: string) {
        const validated: boolean = await invoke("user_signup", { name, password });
        if (validated) {
            this.user.logged = validated;
            this.emitUser();
        }
    }

    async login(password: string) {
        const validated: boolean = await invoke("user_login", { password });
        if (validated) {
            this.user.logged = validated;
            this.emitUser();
        }
    }

    logout() {
        this.user.logged = false;
        this.emitUser();
    }
}
