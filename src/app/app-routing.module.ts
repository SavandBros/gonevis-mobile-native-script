import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from 'nativescript-angular/router';
import { AnonymousGuardService } from '~/app/services/auth-guard/anonymous-guard.service';
import { AuthGuardService } from '~/app/services/auth-guard/auth-guard.service';

const routes: Routes = [{
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
}, {
    path: 'dash',
    loadChildren: '~/app/components/dash/dash.module#DashModule',
    canLoad: [AuthGuardService]
}, {
    path: 'login',
    loadChildren: '~/app/components/login/login.module#LoginModule',
    canLoad: [AnonymousGuardService]
}, {
    path: 'home',
    loadChildren: '~/app/home/home.module#HomeModule'
}];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule {
}
