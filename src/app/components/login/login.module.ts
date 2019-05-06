import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { LoginComponent } from '~/app/components/login/login.component';
import { LoginRoutingModule } from '~/app/components/login/login-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NativeScriptFormsModule } from 'nativescript-angular';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    NativeScriptCommonModule,
    ReactiveFormsModule,
    NativeScriptFormsModule,
    LoginRoutingModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class LoginModule {
}
