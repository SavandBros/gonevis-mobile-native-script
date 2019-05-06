import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { RadSideDrawerComponent } from 'nativescript-ui-sidedrawer/angular';
import { RadSideDrawer } from 'nativescript-ui-sidedrawer';
import { User, UserBlog } from '~/app/models/user/user';
import { AuthService } from '~/app/services/auth/auth.service';
import { RouterExtensions } from 'nativescript-angular';


@Component({
  moduleId: module.id,
  selector: 'ns-app',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(RadSideDrawerComponent) public drawerComponent: RadSideDrawerComponent;
  private drawer: RadSideDrawer;
  public user: User;
  public blog: UserBlog;
  public appPages = [{
    title: 'Posts',
    url: 'posts',
    icon: 'f550'
  }, {
    title: 'Pages',
    url: 'pages',
    icon: 'f15c'
  }];

  constructor(private changeDetectorRef: ChangeDetectorRef, private router: RouterExtensions,
              private authService: AuthService) {
  }

  ngOnInit() {
    // Dynamically get current user's data.
    this.authService.user.subscribe((user: User): void => {
      this.user = user;
    });

    // Dynamically get current blog's data.
    this.authService.blog.subscribe((blog: UserBlog): void => {
      this.blog = blog;
    });
  }

  ngAfterViewInit() {
    this.drawer = this.drawerComponent.sideDrawer;
    this.changeDetectorRef.detectChanges();
  }

  getIcon(icon: string): string {
    return String.fromCharCode(parseInt(icon, 16));
  }

  onNavigationsTap(url: string) {
    this.drawer.closeDrawer();
  }
}
