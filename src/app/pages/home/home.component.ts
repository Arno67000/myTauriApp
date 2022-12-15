import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { User } from "../../models/interfaces";
import { UserService } from "../../services/user.service";

@Component({
    selector: "app-home",
    template: `<button class="form-group-btn" type="button" (click)="logout()"><-</button> `,
    styles: [
        `
            .form-group-btn {
                margin-top: 30px;
                font-weight: bolder;
                background: #fff;
                color: #000;
                cursor: pointer;
                width: 30px;
                height: 30px;
            }
        `
    ]
})
export class HomeComponent implements OnInit, OnDestroy {
    userSubscription: Subscription;
    user: User = {
        name: null,
        logged: false
    };

    constructor(private router: Router, private userService: UserService) {
        this.userSubscription = this.userService.userSubject.subscribe((user) => (this.user = user));
        this.userService.emitUser();

        if (!this.user.logged) {
            this.router.navigate(["/login"]).catch((error) => {
                console.log(error);
            });
        }
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.userSubscription?.unsubscribe();
    }

    logout(): void {
        this.user = {
            name: null,
            logged: false
        };
        console.log("User logged out");
        this.userService.emitUser();
        this.router
            .navigate(["/login"])
            .then(() => console.log("navigated"))
            .catch((error) => {
                console.log(error);
            });
    }
}
