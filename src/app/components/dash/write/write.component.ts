import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { WriteService } from '@app/components/dash/write/write.service';
import { EntryStatuses } from '@app/enums/entrt-statuses';
import { Entry } from '@app/interfaces/entry';
import { BlogService } from '@app/services/blog/blog.service';
import { SnackBar } from '@nstudio/nativescript-snackbar';
import { RouterExtensions } from 'nativescript-angular';
import { WebViewInterface } from 'nativescript-webview-interface';
import { Page } from 'tns-core-modules/ui/page';
import { LoadEventData, WebView } from 'tns-core-modules/ui/web-view';
import * as utils from 'tns-core-modules/utils/utils';

const equal = require('deep-equal');
const cloneDeep = require('lodash.clonedeep');
const dialogs = require('tns-core-modules/ui/dialogs');

@Component({
  selector: 'ns-write',
  templateUrl: './write.component.html',
  styleUrls: ['./write.component.css'],
  moduleId: module.id,
})
export class WriteComponent implements OnInit {

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
  private oldEntry: Entry;

  /**
   * Snackbar
   */
  private snackBar: SnackBar = new SnackBar();

  /**
   * Webview interface
   */
  oWebViewInterface: WebViewInterface;

  entry: Entry = {
    title: '',
    content: '',
    status: EntryStatuses.DRAFT,
    site: BlogService.currentBlog.id,
  };

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private routerExtensions: RouterExtensions,
              private route: ActivatedRoute,
              private ngZone: NgZone,
              private writeService: WriteService,
              private pageView: Page) {
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
        this.writeService.getEntry(params.entryId).subscribe((data: Entry): void => {
          this.initWebView();
          this.oldEntry = cloneDeep(data);
          if (data.entrydraft) {
            data = data.entrydraft;
            /**
             * Instantiate a SnackBar
             */
            this.snackBar.simple('You have unpublished changes', '#fff', '#f57c00');
          }
          this.entry = data;
        });
      }
    });

    this.pageView.on(Page.navigatingFromEvent, (): void => {
      this.snackBar.dismiss();
      utils.ad.dismissSoftInput();
    })
  }

  /**
   * Setup web view
   */
  initWebView(): void {
    let webViewSrc = '~/assets/editor/index.html';
    let webviewN = this.webView.nativeElement;
    this.oWebViewInterface = new WebViewInterface(this.webView.nativeElement, webViewSrc);
    webviewN.on(WebView.loadStartedEvent, function (args: LoadEventData) {
      if (webviewN.android) {
        webviewN.android.setBackgroundColor(0x00000000);
        webviewN.android.getSettings().setBuiltInZoomControls(false);
        webviewN.android.setScrollContainer(false);
      } else {
        webviewN.ios.configuration.preferences.javaScriptEnabled = true;
        webviewN.ios.scrollView.minimumZoomScale = 1.0;
        webviewN.ios.scrollView.maximumZoomScale = 1.0;
        webviewN.ios.scalesPageToFit = true;
      }
    });

    webviewN.on(WebView.loadFinishedEvent, (args: LoadEventData) => {
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
    await this.writeService.updateEntry(this.entryId, this.entry).toPromise().then((data: Entry): void => {
      let entryType = data.is_page ? 'Page' : 'Post';
      let updateType = data.status === EntryStatuses.PUBLISHED ? 'published' : 'drafted';
      let snackBarBackgroundColor = data.status === EntryStatuses.PUBLISHED ? '#00caab' : '#5c687c';
      this.entry = data;
      this.oldEntry = cloneDeep(data);
      this.snackBar.simple(`${entryType} ${updateType} successfully`, '#fff', snackBarBackgroundColor);
      this.setContent(data.content);
    });
  }
}
