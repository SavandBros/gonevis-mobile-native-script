import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '~/app/services/auth/auth.service';
import { Router } from '@angular/router';

const dialogs = require('tns-core-modules/ui/dialogs');


@Component({
  selector: 'ns-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  moduleId: module.id,
})
export class LoginComponent implements OnInit {
  // Login form.
  logInForm: FormGroup;
  // This variable indicates whether we are authenticating in user or not.
  loading: boolean;

  constructor(private formBuilder: FormBuilder, private router: Router,
              private authService: AuthService, private cdRef: ChangeDetectorRef) {
    this.loading = false;
  }

  ngOnInit() {
    this.logInForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /*
  * This function will return login form controls.
  * */
  get form(): { [key: string]: AbstractControl } {
    return this.logInForm.controls;
  }

  /*
  * This function will authenticate user.
  * */
  login(): void {
    // Break function if form is invalid.
    if (this.logInForm.invalid) {
      return;
    }
    // Update loading state.
    this.loading = true;
    // Detect changes.
    this.cdRef.detectChanges();

    // Payload required by BackEnd.
    const payload: { username: string, password: string } = {
      username: this.form.username.value,
      password: this.form.password.value
    };

    // API call
    this.authService.login(payload).subscribe((data: string): void => {
      // Update loading state.
      this.loading = false;
      // Redirect user to 'Entries' page
      this.router.navigate(['/dash']);
    }, (errors: Array<object>): void => {
      console.log(errors);
      // Update loading state.
      this.loading = false;
      // console.log(errors)
      dialogs.alert({
        title: 'Oops!',
        message: errors['non_field_errors'][0],
        okButtonText: 'OK'
      });
    });
  }
}
