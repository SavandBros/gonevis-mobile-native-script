import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from 'nativescript-angular';
import { DashComponent } from '~/app/components/dash/dash.component';

const routes: Routes = [{
  path: '',
  component: DashComponent,
  children: [{
    path: 'write',
    loadChildren: '~/app/components/dash/write/write.module#WriteModule',
  }, {
    path: 'write/:entryId',
    loadChildren: '~/app/components/dash/write/write.module#WriteModule',
  }, {
    path: 'posts',
    loadChildren: '~/app/components/dash/entries/entries.module#EntriesModule',
    data: {
      isPage: false,
    },
  }, {
    path: 'pages',
    loadChildren: '~/app/components/dash/entries/entries.module#EntriesModule',
    data: {
      isPage: true,
    },
  }, {
    path: '',
    redirectTo: 'posts',
    pathMatch: 'full',
  }],
}];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes)],
  exports: [NativeScriptRouterModule],
})
export class DashRoutingModule {
}
