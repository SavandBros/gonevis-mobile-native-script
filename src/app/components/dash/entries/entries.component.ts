import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Data, Params, Router } from '@angular/router';
import { EntriesService } from '@app/components/dash/entries/entries.service';
import { EntryStatuses } from '@app/enums/entrt-statuses';
import { ApiResponse } from '@app/interfaces/api-response';
import { EntriesResponse } from '@app/interfaces/entries-response';
import { Entry } from '@app/interfaces/entry';
import { EntryTab } from '@app/interfaces/entry-tab';
import { ApiService } from '@app/services/api/api.service';
import { RouterExtensions } from 'nativescript-angular';
import { ListViewEventData, ListViewLoadOnDemandMode } from 'nativescript-ui-listview';
import { RadListViewComponent } from 'nativescript-ui-listview/angular';
import { LoadOnDemandListViewEventData } from 'nativescript-ui-listview/ui-listview.common';
import { action, ActionOptions, ConfirmOptions, confirm } from 'tns-core-modules/ui/dialogs';
import { SegmentedBarItem } from 'tns-core-modules/ui/segmented-bar';

@Component({
  selector: 'ns-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.css'],
  moduleId: module.id,
})
export class EntriesComponent implements OnInit {

  /**
   * RadListView component reference
   */
  @ViewChild('radListViewComponent', { static: false }) radListView: RadListViewComponent;

  /**
   * Entry tabs
   */
  tabs: EntryTab[] = [{
    label: 'Published',
    queryParam: 'published',
    status: EntryStatuses.PUBLISHED,
  }, {
    label: 'Draft',
    queryParam: 'draft',
    status: EntryStatuses.DRAFT,
  }];

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
  entries: ApiResponse<Entry>;

  /**
   * Indicates whether to load pages or posts
   */
  isPage: boolean;

  /**
   * Search form
   */
  searchForm: FormGroup;

  hello: SegmentedBarItem[] = [];

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private changeDetectionRef: ChangeDetectorRef,
              private routerExtensions: RouterExtensions,
              private formBuilder: FormBuilder,
              private apiService: ApiService,
              private entriesService: EntriesService) {
  }

  ngOnInit(): void {
    this.tabs.map((tab: EntryTab): void => {
      const item = new SegmentedBarItem();
      item.title = tab.label;
      this.hello.push(item);
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
      this.currentTab = this.tabs.find((tab: EntryTab): boolean => params.status === tab.queryParam);
      if (!this.currentTab) {
        this.router.navigate([], {
          queryParams: {
            status: 'published',
          },
          queryParamsHandling: 'merge',
        });
        return;
      }
      this.getEntries();
    });
  }

  /**
   * On page loaded callback
   */
  onPageLoaded(): void {
    this.radListView.nativeElement.loadOnDemandMode = ListViewLoadOnDemandMode.None;
  }

  /**
   * Get entries
   *
   * @param args Generic scheme for event arguments provided to handlers of events exposed
   */
  getEntries(args?: ListViewEventData): void {
    this.loading = true;
    // API call
    this.entriesService.getEntries(this.isPage, this.currentTab.status, this.searchForm.controls.text.value)
      .subscribe((data: EntriesResponse): void => {
        this.loading = false;
        if (this.currentTab.status !== data.status) {
          return;
        }
        this.entries = data.response;
        /**
         * Detect changes
         */
        this.changeDetectionRef.detectChanges();
        /**
         * If args exist, then stop refreshing
         */
        if (args) {
          this.radListView.nativeElement.notifyPullToRefreshFinished();
        }
        /**
         * If there is pagination, then activate load on demand
         */
        if (data.response.next) {
          this.radListView.nativeElement.loadOnDemandMode = ListViewLoadOnDemandMode.Auto;
        }
      });
  }

  /**
   * Load more
   *
   * @param args Load on demand event
   */
  loadMore(args: LoadOnDemandListViewEventData): void {
    if (!this.entries.next) {
      return;
    }
    this.apiService.getEndpoint<Entry>(this.entries.next)
      .subscribe((data: ApiResponse<Entry>): void => {
        this.entries.next = data.next;
        this.entries.previous = data.previous;
        data.results.map((entry: Entry): void => {
          this.entries.results.push(entry);
        });
        /**
         * Deactivate load on demand
         */
        if (!data.next) {
          this.radListView.nativeElement.loadOnDemandMode = ListViewLoadOnDemandMode.None;
        }
        this.radListView.nativeElement.notifyLoadOnDemandFinished();
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
              this.entries.results.splice(index, 1);
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
    this.routerExtensions.navigate(['dash', 'write', this.entries.results[args.index].id]);
  }

  /**
   * @return Entry statuses
   */
  entryStatuses(): typeof EntryStatuses {
    return EntryStatuses
  }
}
