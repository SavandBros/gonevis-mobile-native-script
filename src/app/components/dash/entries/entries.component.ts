import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { EntriesService } from '@app/components/dash/entries/entries.service';
import { EntryStatuses } from '@app/enums/entrt-statuses';
import { ApiResponse } from '@app/interfaces/api-response';
import { EntriesResponse } from '@app/interfaces/entries-response';
import { EntryData } from '@app/interfaces/entry-data';
import { EntryTab } from '@app/interfaces/entry-tab';
import { Entry } from '@app/models/entry';
import { ApiService } from '@app/services/api/api.service';
import { DrawerService } from '@app/services/drawer/drawer.service';
import { RouterExtensions } from 'nativescript-angular';
import { ListViewEventData, ListViewLoadOnDemandMode } from 'nativescript-ui-listview';
import { RadListViewComponent } from 'nativescript-ui-listview/angular';
import { LoadOnDemandListViewEventData, RadListView } from 'nativescript-ui-listview/ui-listview.common';
import { action, ActionOptions, ConfirmOptions, confirm } from 'tns-core-modules/ui/dialogs';
import { Page, isAndroid } from 'tns-core-modules/ui/page';
import { SegmentedBarItem, SegmentedBar, SelectedIndexChangedEventData } from 'tns-core-modules/ui/segmented-bar';

@Component({
  selector: 'ns-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.css'],
  moduleId: module.id,
})
export class EntriesComponent implements OnInit {

  /**
   * Entry tabs
   */
  private static tabs: EntryTab[] = [{
    label: 'Draft',
    queryParam: 'draft',
    status: EntryStatuses.DRAFT,
  }, {
    label: 'Published',
    queryParam: 'published',
    status: EntryStatuses.PUBLISHED,
  }];

  /**
   * RadListView component reference
   */
  @ViewChild('radListViewComponent', { read: RadListViewComponent, static: false }) radListView: RadListViewComponent;

  /**
   * Page title
   */
  title: string;

  /**
   * Current entry tab
   */
  currentTab: EntryTab;

  /**
   * API loading indicator
   */
  loading: boolean;

  /**
   * Entries API response
   */
  entryList: Entry[] = [];

  /**
   * Next endpoint
   */
  next: string;

  /**
   * Indicates whether to load pages or posts
   */
  isPage: boolean;

  /**
   * Search form
   */
  searchForm: FormGroup;

  /**
   * Segmented bar items
   */
  segmentedBarItems: SegmentedBarItem[] = [];

  mode = ListViewLoadOnDemandMode.None;

  constructor(private routerExtensions: RouterExtensions,
              private activatedRoute: ActivatedRoute,
              private changeDetectionRef: ChangeDetectorRef,
              private formBuilder: FormBuilder,
              private apiService: ApiService,
              private entriesService: EntriesService,
              private pageService: Page) {
  }

  ngOnInit(): void {
    EntriesComponent.tabs.map((tab: EntryTab): void => {
      const item = new SegmentedBarItem();
      item.title = tab.label;
      this.segmentedBarItems.push(item);
    });
    /**
     * Setup search form
     */
    this.searchForm = this.formBuilder.group({
      text: ['', Validators.required],
    });
    /**
     * Subscribe to current state's query params changes
     */
    this.activatedRoute.queryParams.subscribe((params: Params): void => {
      this.isPage = this.activatedRoute.snapshot.data.isPage;
      this.title = this.isPage ? 'Pages' : 'Posts';
      this.currentTab = EntriesComponent.tabs.find((tab: EntryTab): boolean => params.status === tab.queryParam);
      if (!this.currentTab) {
        this.routerExtensions.navigate([], {
          queryParams: {
            status: 'published',
          },
          queryParamsHandling: 'merge',
        });
        return;
      }
      this.getEntries();
    });

    this.pageService.on(Page.navigatingFromEvent, (): void => {
      this.entryList = [];
      this.changeDetectionRef.detach();
    });
  }

  /**
   * Get entries
   */
  getEntries(): void {
    this.loading = true;

    // API call
    this.entriesService.getEntries(this.isPage, this.currentTab.status, this.searchForm.controls.text.value)
      .subscribe((data: EntriesResponse): void => {
        this.loading = false;
        if (this.currentTab.status !== data.status) {
          return;
        }
        this.entryList = [];
        this.next = data.response.next;
        this.entryList = data.response.results;
        this.changeDetectionRef.detectChanges();
      });
  }

  /**
   * On segment change callback
   *
   * @param args
   */
  onSegmentChange(args: SelectedIndexChangedEventData): void {
    let segmentedBar = <SegmentedBar>args.object;
    this.currentTab = EntriesComponent.tabs[segmentedBar.selectedIndex];
    this.entryList = [];
    this.routerExtensions.navigate([], {
      queryParams: {
        status: this.currentTab.queryParam,
      },
    })
  }

  /**
   * Load more
   *
   * @param args Load on demand event
   */
  loadMore(args: LoadOnDemandListViewEventData): void {
    const listView: RadListView = args.object;
    if (!this.next) {
      listView.notifyLoadOnDemandFinished();
      return;
    }
    this.apiService.getEndpoint<EntryData>(this.next).subscribe((data: ApiResponse<EntryData>): void => {
      if (data.results[0].status !== this.currentTab.status) {
        listView.notifyLoadOnDemandFinished();
        return;
      }
      this.next = data.next;
      data.results.map((entry: EntryData): void => {
        this.entryList.push(new Entry(entry));
      });
      this.changeDetectionRef.detectChanges();
      /**
       * Deactivate load on demands
       */
      if (!data.next) {
        args.returnValue = false;
        listView.notifyLoadOnDemandFinished(true);
      }
      listView.notifyLoadOnDemandFinished();

    });
  }

  /**
   * Display a action box with 2 options: 'Delete' and 'Edit'
   *
   * @param entryId Entry ID
   * @param index Entry index in list
   */
  options(entryId: string, index: number): void {
    /**
     * Set needed options
     */
    const actionOptions: ActionOptions = {
      cancelButtonText: 'Cancel',
      actions: ['Edit', 'Delete'],
    };
    /**
     * Action callback
     */
    action(actionOptions).then((result: string): void => {
      /**
       * If result was 'Delete'
       */
      if (result === 'Delete') {
        const confirmOptions: ConfirmOptions = {
          title: 'Delete',
          message: 'This action is not reversible. Are you sure?',
          okButtonText: 'Delete',
          cancelButtonText: 'Cancel',
        };

        confirm(confirmOptions).then((confirmResult: boolean): void => {
          if (confirmResult) {
            this.entriesService.removeEntry(entryId).subscribe((): void => {
              this.entryList.splice(index, 1);
              /**
               * Detect changes
               */
              this.changeDetectionRef.detectChanges();
            });
          }
        });
      }
      /**
       * If results was 'Edit'
       */
      if (result === 'Edit') {
        this.routerExtensions.navigate(['dash', 'write', entryId]);
      }
    });
  }

  /**
   * Navigate to edit
   *
   * @param args Generic scheme for event arguments provided to handlers of events exposed
   */
  navigateToWrite(args: ListViewEventData): void {
    this.routerExtensions.navigate(['dash', 'write', this.entryList[args.index].id]);
  }

  /**
   * Toggle drawer
   */
  toggleDrawer(): void {
    DrawerService.toggleDrawer();
  }

  getIconSource(icon: string): string {
    const iconPrefix = isAndroid ? 'res://' : 'res://tabIcons/';

    return iconPrefix + icon;
  }
}
