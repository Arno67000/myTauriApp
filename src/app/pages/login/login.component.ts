import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../../services/user.service";
import { User } from "../../models/interfaces";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";

@Component({
    selector: "app-login",
    template: `
        <div class="container">
            <h1>WELCOME {{ user.name?.toUpperCase() }}</h1>
            <div class="forms" *ngIf="user.name === null">
                <form class="form-group" [formGroup]="signupForm" (ngSubmit)="sign()">
                    <input
                        autofocus
                        type="name"
                        id="name"
                        class="form-control"
                        formControlName="name"
                        maxlength="12"
                        minlength="3"
                        aria-required="true"
                        aria-label="name"
                        placeholder="name"
                        required
                    />
                    <input
                        type="password"
                        id="password"
                        class="form-control"
                        formControlName="password"
                        minlength="3"
                        maxlength="12"
                        aria-required="true"
                        aria-label="password"
                        placeholder="password"
                        required
                    />
                    <button class="form-group-btn" type="submit" [disabled]="signupForm.invalid">signup</button>
                </form>
            </div>
            <div class="forms" *ngIf="user.name">
                <form [formGroup]="loginForm" (ngSubmit)="log()">
                    <input
                        autofocus
                        type="password"
                        id="password"
                        class="form-control"
                        formControlName="password"
                        minlength="3"
                        maxlength="12"
                        aria-required="true"
                        aria-label="password"
                        placeholder="password"
                        required
                    />
                    <button class="form-group-btn" type="submit" [disabled]="loginForm.invalid">enter</button>
                </form>
            </div>
        </div>
    `,
    styles: [
        `
            .container {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
        `
    ]
})
export class LoginComponent implements OnInit, OnDestroy {
    userSubscription: Subscription;
    user: User = {
        name: null,
        logged: false
    };

    signupForm: FormGroup;
    loginForm: FormGroup;

    constructor(private userService: UserService, private formBuilder: FormBuilder, private router: Router) {
        this.userSubscription = this.userService.userSubject.subscribe((user) => (this.user = user));
        this.userService.emitUser();

        if (this.user.logged) {
            this.router.navigate(["/home"]);
        }

        this.signupForm = this.formBuilder.group({
            name: ["", Validators.required],
            password: ["", Validators.required]
        });

        this.loginForm = this.formBuilder.group({
            password: ["", Validators.required]
        });
    }

    ngOnInit(): void {
        this.userService.start();
    }

    ngOnDestroy(): void {
        this.userSubscription?.unsubscribe();
    }

    sign() {
        const { name, password } = this.signupForm.value;
        this.userService.signup(name, password);
    }
    log() {
        const { password } = this.loginForm.value;
        this.userService.login(password);
    }
}
