import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WebViewInterface } from 'nativescript-webview-interface';
import { LoadEventData, WebView } from 'tns-core-modules/ui/web-view';
import { WriteService } from '~/app/services/write/write.service';
import { RouterExtensions } from 'nativescript-angular';
import Entry from '~/app/models/entry/entry';
import { AuthService } from '~/app/services/auth/auth.service';
import { EntryStatuses } from '~/app/enums/entry_statuses/entry_statuses';
import { EntryService } from '~/app/services/entry/entry.service';
import { ActivatedRoute, Params } from '@angular/router';
import { SnackBar } from 'nativescript-snackbar';

const equal = require('deep-equal');
const cloneDeep = require('lodash.clonedeep');
const dialogs = require('tns-core-modules/ui/dialogs');

@Component({
  selector: 'ns-write',
  templateUrl: './write.component.html',
  styleUrls: ['./write.component.css'],
  moduleId: module.id,
})
export class WriteComponent implements OnInit, OnDestroy {
  oWebViewInterface: any;
  @ViewChild('webView') webView: ElementRef;
  // Current entry's id.
  private entryId: string;
  // Instance of entry.
  entry: Entry = new Entry({ content: '', site: this.authService.blogValue.id });
  // And instance of entry which will hold old entry.
  private oldEntry: Entry;

  constructor(private changeDetectorRef: ChangeDetectorRef, private routerExtensions: RouterExtensions,
              private route: ActivatedRoute, private ngZone: NgZone,
              private writeService: WriteService, private authService: AuthService,
              private entryService: EntryService) {
  }

  ngOnInit() {
    // Instance of entry.
    this.entry = new Entry({ content: '', site: this.authService.blogValue.id });
    // Make a copy of entry.
    this.oldEntry = cloneDeep(this.entry);
    // Subscribe to current route's params.
    this.route.params.subscribe((params: Params): void => {
      // Check if there is 'entryId' in params.
      if (params.entryId) {
        // Update current entry's id.
        this.entryId = params.entryId;
        // Get entry based on param's 'entryId' value.
        this.entryService.detail(`website/entry/${params.entryId}/`).subscribe((data: Entry): void => {
          this.initWebView();

          // Make a copy of returned data.
          this.oldEntry = cloneDeep(data);
          if (data.entrydraft) {
            data = data.entrydraft;
            // Create an instance of SnackBar
            const snackbar = new SnackBar();
            snackbar.simple('You have unpublished changes', '#fff', '#f57c00').then();
          }
          // Update entry.
          this.entry = data;
        });
      }
    });
  }

  initWebView() {
    let webViewSrc = '~/app/editor/index.html';
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

  setContent(content: string): void {
    this.oWebViewInterface.emit('setContent', content);
  }

  presentConfirm() {
    dialogs.confirm({
      title: 'Ready to publish?',
      message: 'Your message',
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
          }
        );
      }
    });
  }

  goBack(): void {
    this.oWebViewInterface.callJSFunction(
      'getContent',
      [],
      (response: { content: string, contentEquality: boolean }): void => {
        if (!response.contentEquality) {
          this.entry.content = response.content;
        }
        let isEqual = equal(this.entry, this.oldEntry);
        // Check equality.
        if (this.oldEntry.entrydraft) {
          isEqual = equal(this.entry, this.oldEntry.entrydraft);
        }
        if (!isEqual) {
          // Check if entry's status is published.
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
      }
    );
  }

  /**
   * Update entry.
   *
   * @param status Status of entry.
   */
  async updateEntry(status?: number): Promise<void> {
    // If draft, then change entry's status.
    this.entry.status = status;
    // API call.
    await this.entryService.put(`website/entry/${this.entryId}/`, this.entry).toPromise().then((data: Entry): void => {
      // Update entry data.
      this.entry = data;
      // Update old entry data.
      this.oldEntry = cloneDeep(data);
      this.setContent(data.content);
    }, (error: Array<Object>): void => {
    });
  }

  ngOnDestroy() {
    this.changeDetectorRef.detach();
  }

}
