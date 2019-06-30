import { NgModule } from '@angular/core';
import { NativeScriptRouterModule } from 'nativescript-angular';
import { Routes } from '@angular/router';
import { StartComponent } from '~/app/components/start/start.component';

const routes: Routes = [{
  path: '',
  component: StartComponent
}];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule]
})
export class StartRoutingModule {
}
