import { ItemEventData } from 'tns-core-modules/ui/list-view'
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UrlTree } from '@angular/router';
import { BlogMinimalUser } from '@app/interfaces/blog-minimal-user';
import { UserAuth } from '@app/interfaces/user-auth';
import { BlogService } from '@app/services/blog/blog.service';
import { RouterExtensions } from 'nativescript-angular';
import { ListViewEventData } from 'nativescript-ui-listview/ui-listview.common';
import { RadSideDrawer } from 'nativescript-ui-sidedrawer';
import { RadSideDrawerComponent } from 'nativescript-ui-sidedrawer/angular';
import { AuthService } from '~/app/services/auth/auth.service';

const dialogs = require('tns-core-modules/ui/dialogs');

@Component({
  moduleId: module.id,
  selector: 'ns-app',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnInit, AfterViewInit {
  /**
   * Rad side drawer component reference
   */
  @ViewChild(RadSideDrawerComponent, { static: false }) drawerComponent: RadSideDrawerComponent;

  /**
   * Side drawer
   */
  private drawer: RadSideDrawer;

  /**
   * Authenticated user
   */
  public user: UserAuth;

  /**
   * Current blog
   */
  public blog: BlogMinimalUser;

  /**
   * App pages
   */
  public appPages = [{
    title: 'Posts',
    url: 'posts',
    icon: 'f550',
  }, {
    title: 'Pages',
    url: 'pages',
    icon: 'f15c',
  }];

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private router: RouterExtensions,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    /**
     * Subscribe to user changes
     */
    this.authService.user.subscribe((user: UserAuth): void => {
      this.user = user;
    });
    /**
     * Subscribe to blog changes
     */
    BlogService.blog.subscribe((blog: BlogMinimalUser): void => {
      this.blog = blog;
    });
  }

  ngAfterViewInit(): void {
    this.drawer = this.drawerComponent.sideDrawer;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Get icon
   *
   * @param icon
   */
  getIcon(icon: string): string {
    return String.fromCharCode(parseInt(icon, 16));
  }

  /**
   * Navigate to page and close side drawer
   *
   * @param event List view event
   */
  onNavigationsTap(event: ListViewEventData): void {
    this.router.navigate(['/dash', this.appPages[event.index].url]);
    this.drawer.closeDrawer();
  }

  /**
   * Logout
   */
  logOut(): void {
    dialogs.confirm({
      title: 'Logout',
      message: 'Are you sure you want to logout from your account?',
      okButtonText: 'Logout',
      cancelButtonText: 'No',
    }).then((result: boolean): void => {
      if (result) {
        this.authService.unAuth();
        this.drawer.closeDrawer();
      }
    });
  }

  /**
   * @param route Route URL
   *
   * @return Boolean which determines whether given route is currently active or not
   */
  isRouteActive(route: string): boolean {
    const urlTree: UrlTree = this.router.router.createUrlTree(['dash', route]);
    return this.router.router.isActive(urlTree, false);
  }
}
