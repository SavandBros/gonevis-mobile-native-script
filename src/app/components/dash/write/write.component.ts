import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { WriteService } from '@app/components/dash/write/write.service';
import { EntryStatuses } from '@app/enums/entrt-statuses';
import { EntryData } from '@app/interfaces/entry-data';
import { ApiResponseModel } from '@app/models/api-response-model';
import { Entry } from '@app/models/entry';
import { Tag } from '@app/models/tag';
import { SnackBar } from '@nstudio/nativescript-snackbar';
import { RouterExtensions } from 'nativescript-angular/router';
import { RadListViewComponent } from 'nativescript-ui-listview/angular';
import { ListViewEventData } from 'nativescript-ui-listview/ui-listview.common';

import { WebViewInterface } from 'nativescript-webview-interface';
import { screen } from 'tns-core-modules/platform/platform';
import { CubicBezierAnimationCurve } from 'tns-core-modules/ui/animation';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures';
import { Page, EventData, View } from 'tns-core-modules/ui/page';
import { SearchBar } from 'tns-core-modules/ui/search-bar';
import { Switch } from 'tns-core-modules/ui/switch';
import { LoadEventData, WebView } from 'tns-core-modules/ui/web-view';
import * as utils from 'tns-core-modules/utils/utils';

const equal = require('deep-equal');
const cloneDeep = require('lodash.clonedeep');
const dialogs = require('tns-core-modules/ui/dialogs');


@Component({
  selector: 'ns-write',
  templateUrl: './write.component.html',
  styleUrls: ['./write.component.scss'],
  moduleId: module.id,
})
export class WriteComponent implements OnInit {

  @ViewChild('myListView', { read: RadListViewComponent, static: false }) myListViewComponent: RadListViewComponent;
  private searchBar: SearchBar;

  /**
   * Webview element reference
   */
  @ViewChild('webView', { static: false }) webView: ElementRef;

  /**
   * Current entry ID
   */
  private entryId: string;

  /**
   * Old entry
   */
  private oldEntry: EntryData;

  /**
   * Snackbar
   */
  private snackBar: SnackBar = new SnackBar();

  /**
   * Tag list
   */
  private tags: Tag[] = [];

  /**
   * Page height
   */
  pageHeight = screen.mainScreen.heightDIPs;

  /**
   * Filtered tags
   */
  filteredTags: Tag[] = [];

  /**
   * Tag managing indicator
   */
  updateSheet: boolean;

  /**
   * Search text
   */
  searchText: string;

  /**
   * Managing tags indicator
   */
  managingTags: boolean;

  /**
   * Webview interface
   */
  oWebViewInterface: WebViewInterface;

  entry: Entry;

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private routerExtensions: RouterExtensions,
              private route: ActivatedRoute,
              private ngZone: NgZone,
              private viewContainerRef: ViewContainerRef,
              private writeService: WriteService,
              private pageView: Page) {
  }

  onPageLoaded(args: EventData): void {
    const page = <View>args.object;
    setTimeout((): void => {
      this.pageHeight = page.getMeasuredHeight();
    });
  }

  /**
   * On search bar loaded callback
   *
   * @param args Event data
   */
  onSearchBarLoaded(args): void {
    this.searchBar = <SearchBar>args.object;
  }

  onTagSearchTextChanged(args: EventData) {
    let searchBar = <SearchBar>args.object;
    // If value was empty
    if (!searchBar.text) {
      this.filteredTags = [];
      return;
    }
    // Filter tags based on value
    this.filteredTags = this.tags.filter((tag: Tag): boolean => {
      return !this.entry.tags.some((entryTag: Tag): boolean => entryTag.id === tag.id) &&
        tag.name.toLowerCase().indexOf(searchBar.text.toLowerCase()) > -1
    });
  }

  /**
   * On cell swipe started
   *
   * @param args List view event data
   */
  onSwipeCellStarted(args: ListViewEventData): void {
    const swipeLimits = args.data.swipeLimits;
    args.data.swipeLimits.threshold = 3000;
    const swipeView = args['object'];
    const leftItem = swipeView.getViewById('delete-tag-left');
    const rightItem = swipeView.getViewById('delete-tag-right');
    swipeLimits.left = leftItem.getMeasuredWidth();
    swipeLimits.right = rightItem.getMeasuredWidth();
    swipeLimits.threshold = leftItem.getMeasuredWidth() / 2;
  }

  /**
   * On left swipe action clicked
   *
   * @param args List view event data
   */
  onActionSwipeClick(args: ListViewEventData): void {
    this.myListViewComponent.listView.notifySwipeToExecuteFinished();
    const index = this.entry.tags.findIndex((tag: Tag): boolean => tag.id === args.object.bindingContext.id);
    this.entry.tags.splice(index, 1);
  }

  /**
   * Add tag
   */
  addTag(event: ListViewEventData): void {
    this.entry.tags.unshift(this.filteredTags[event.index]);
    this.filteredTags = [];
    this.searchBar.text = '';
  }

  ngOnInit() {
    /**
     * Make a copy of entry
     */
    this.oldEntry = cloneDeep(this.entry);
    /**
     * Subscribe to current route's params
     */
    this.route.params.subscribe((params: Params): void => {
      /**
       * Check entry ID existence
       */
      if (params.entryId) {
        this.entryId = params.entryId;
        this.writeService.getEntry(params.entryId).subscribe((data: EntryData): void => {
          this.initWebView();
          this.oldEntry = cloneDeep(new Entry(data));
          if (data.entrydraft) {
            data = data.entrydraft;
            /**
             * Instantiate a SnackBars
             */
            this.snackBar.simple('You have unpublished changes', '#fff', '#f57c00');
          }
          this.entry = new Entry(data);
        });
      }
    });

    this.pageView.on(Page.navigatingFromEvent, (): void => {
      this.snackBar.dismiss();
      utils.ad.dismissSoftInput();
      this.webView.nativeElement.off(WebView.loadStartedEvent);
      this.webView.nativeElement.off(WebView.loadFinishedEvent);
      this.webView.nativeElement.android.destroy();
      this.oWebViewInterface.destroy();
    });

    this.writeService.getTags().subscribe((data: ApiResponseModel<Tag>): void => {
      this.tags = data.results;
    });
  }

  /**
   * Setup web view
   */
  initWebView(): void {
    let webViewSrc = '~/assets/editor/index.html';
    this.oWebViewInterface = new WebViewInterface(this.webView.nativeElement, webViewSrc);


    this.webView.nativeElement.on(WebView.loadStartedEvent, function (args: LoadEventData) {
      let webView: WebView = <WebView>args.object;
      if (webView.android) {
        webView.android.getSettings().setJavaScriptEnabled(true);
        webView.android.getSettings().setBuiltInZoomControls(false);
        webView.android.setScrollContainer(false);
      } else {
        webView.ios.configuration.preferences.javaScriptEnabled = true;
        webView.ios.scrollView.minimumZoomScale = 1.0;
        webView.ios.scrollView.maximumZoomScale = 1.0;
        webView.ios.scalesPageToFit = true;
      }
    });

    this.webView.nativeElement.on(WebView.loadFinishedEvent, (args: LoadEventData) => {
      if (!args.error) {
        this.setContent(this.entry.content);
      } else {
        console.log('error');
        console.dir(args.error);
      }
    });
  }

  /**
   * Set entry content
   *
   * @param content Content to set
   */
  setContent(content: string): void {
    this.oWebViewInterface.emit('setContent', content);
  }

  /**
   * Display a action box with 2 options: 'Publish' and 'Not yet'
   */
  presentConfirm(): void {
    dialogs.confirm({
      title: 'Ready to publish?',
      okButtonText: 'Publish',
      cancelButtonText: 'Not yet',
      neutralButtonText: 'Cancel',
    }).then((result: boolean | undefined): void => {
      if (result !== undefined) {
        this.oWebViewInterface.callJSFunction(
          'getContent',
          [],
          (response: { content: string, contentEquality: boolean }): void => {
            this.entry.content = response.content;
            this.updateEntry(result ? EntryStatuses.PUBLISHED : EntryStatuses.DRAFT);
          },
        );
      }
    });
  }

  /**
   * Update entry and navigate back to posts/pages
   */
  goBack(): void {
    this.oWebViewInterface.callJSFunction(
      'getContent',
      [],
      (response: { content: string, contentEquality: boolean }): void => {
        if (!response.contentEquality) {
          this.entry.content = response.content;
        }
        let isEqual = equal(this.entry, this.oldEntry);
        /**
         * Check equality
         */
        if (this.oldEntry.entrydraft) {
          isEqual = equal(this.entry, this.oldEntry.entrydraft);
        }
        if (!isEqual) {
          /**
           * Check if entry's status is published
           */
          if (this.entry.status === EntryStatuses.PUBLISHED) {
            delete this.entry.status;
          }
          console.log('NOT EQUAL');
          this.updateEntry().then((): Promise<boolean> => {
            return this.ngZone.run((): Promise<boolean> => this.routerExtensions.navigate(['/dash', 'posts']));
          });
        } else {
          console.log('EQUAL');
          this.ngZone.run((): Promise<boolean> => this.routerExtensions.navigate(['/dash', 'posts']));
        }
      },
    );
  }

  /**
   * Update entry
   *
   * @param status Status of entry
   */
  async updateEntry(status?: number): Promise<void> {
    this.entry.status = status;
    this.entry.tags.forEach((tag: Tag): number => this.entry.tag_ids.push(tag.id));
    await this.writeService.updateEntry(this.entryId, this.entry).toPromise().then((data: EntryData): void => {
      let entryType = data.is_page ? 'Page' : 'Post';
      let updateType = data.status === EntryStatuses.PUBLISHED ? 'published' : 'drafted';
      let snackBarBackgroundColor = data.status === EntryStatuses.PUBLISHED ? '#00caab' : '#5c687c';
      this.entry = new Entry(data);
      this.oldEntry = cloneDeep(new Entry(data));
      this.snackBar.simple(`${entryType} ${updateType} successfully`, '#fff', snackBarBackgroundColor);
      this.setContent(data.content);
    });
  }

  /**
   * Show settings modal dialogss
   */
  showUpdateSheet(): void {
    utils.ad.dismissSoftInput();
    this.updateSheet = true;
    this.managingTags = false;
    const view: View = this.pageView.getViewById<View>('hiddenLayout');
    const backDrop: View = this.pageView.getViewById<View>('backdrop');
    view.animate({
      target: view,
      curve: 'ease',
      duration: 200,
      height: this.pageHeight / 4,
      opacity: 1,
      translate: {
        x: 0,
        y: this.pageHeight / 8,
      },
    });
    backDrop.animate({
      target: view,
      curve: 'ease',
      duration: 200,
      opacity: 0.5,
    });
  }

  hideUpdateSheet(): void {
    this.updateSheet = false;
    this.managingTags = false;
    const view: View = this.pageView.getViewById<View>('hiddenLayout');
    const backDrop: View = this.pageView.getViewById<View>('backdrop');
    view.animate({
      target: view,
      curve: 'ease',
      duration: 200,
      height: this.pageHeight / 4,
      opacity: 1,
      translate: {
        x: 0,
        y: this.pageHeight,
      },
    });
    backDrop.animate({
      target: view,
      curve: 'ease',
      duration: 200,
      opacity: 0,
    });
  }

  manageTags(): void {
    this.managingTags = true;
    const view: View = this.pageView.getViewById<View>('hiddenLayout');
    view.animate({
      target: view,
      curve: 'ease',
      duration: 200,
      height: this.pageHeight,
      translate: {
        x: 0,
        y: 0,
      },
    });
  }

  /**
   * On checkbox value changed
   *
   * @param args Event data
   */
  onCheckedChange(args: EventData): void {
    let switchWidget: Switch = args.object as Switch;
    this.entry.comment_enabled = switchWidget.checked;
  }
}
