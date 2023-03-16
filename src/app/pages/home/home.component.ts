import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { User } from "../../models/interfaces";
import { UserService } from "../../services/user.service";

@Component({
    selector: "app-home",
    template: `<button class="logout-btn" type="button" (click)="logout()"><-</button> `,
    styles: [
        `
            .logout-btn {
                margin-top: 10px;
                font-weight: bolder;
                background: #000;
                color: #fff;
                cursor: pointer;
                border: none;
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
        this.userSubscription = this.userService.userSubject.subscribe((user) => {
            this.user = user;
            if (!this.user.logged) {
                this.router.navigate(["/login"]);
            }
        });
        this.userService.emitUser();
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        this.userSubscription?.unsubscribe();
    }

    logout(): void {
        this.userService.logout();
    }
}
