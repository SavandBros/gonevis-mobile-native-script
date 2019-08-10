import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DrawerService {

  /**
   * Drawer toggle subject
   */
  private static drawerToggleSubject: BehaviorSubject<void> = new BehaviorSubject<void>(null);

  /**
   * Drawer toggle observable
   *
   */
  static drawerToggle: Observable<void> = DrawerService.drawerToggleSubject.asObservable();

  constructor() {
  }

  /**
   * Toggle drawer
   */
  static toggleDrawer(): void {
    DrawerService.drawerToggleSubject.next();
  }
}
