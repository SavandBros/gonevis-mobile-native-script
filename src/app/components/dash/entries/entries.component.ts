import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import Entry from '~/app/models/entry/entry';
import { ApiResponseService } from '~/app/services/base-model/api-response.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EntryService } from '~/app/services/entry/entry.service';
import { AuthService } from '~/app/services/auth/auth.service';
import { ListViewEventData, ListViewLoadOnDemandMode } from 'nativescript-ui-listview';
import { LoadOnDemandListViewEventData } from 'nativescript-ui-listview/ui-listview.common';
import { RadListViewComponent } from 'nativescript-ui-listview/angular';
import { action, ActionOptions, ConfirmOptions } from 'tns-core-modules/ui/dialogs';
import { confirm } from 'tns-core-modules/ui/dialogs';
import { RouterExtensions } from 'nativescript-angular';

@Component({
  selector: 'ns-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.css'],
  moduleId: module.id,
})
export class EntriesComponent implements OnInit {
  @ViewChild('radListViewComponent') radListView: RadListViewComponent;
  // This variable indicates whether we are getting entries or not.
  loading: boolean;
  // Entries API response.
  entries: ApiResponseService<Entry> = new ApiResponseService<Entry>(0, null, null, []);
  // This variable indicates whether we should show entries or pages.
  isPage: boolean;
  // Search form.
  searchForm: FormGroup;

  constructor(private route: ActivatedRoute, private changeDetectionRef: ChangeDetectorRef,
              private routerExtensions: RouterExtensions, private formBuilder: FormBuilder,
              private entryService: EntryService, private authService: AuthService) {
    // Update loading state.
    this.loading = true;
    // Setup search form.
    this.searchForm = this.formBuilder.group({
      text: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Param event subscription.
    this.route.data.subscribe((value: Data): void => {
      this.isPage = !!value.isPage;
      this.getEntries();
    });
  }

  onPageLoaded() {
    this.radListView.nativeElement.loadOnDemandMode = ListViewLoadOnDemandMode.None;
  }

  getEntries(args?: ListViewEventData): void {
    // Update loading state.
    this.loading = true;
    // Set needed params.
    const params: { [key: string]: string } = {
      site: this.authService.blogValue.id,
      is_page: this.isPage.toString(),
      search: this.searchForm.controls.text.value
    };
    // API call.
    this.entryService.get('website/entry/', params).subscribe((data: ApiResponseService<Entry>): void => {
      // If there was a refresh event, then stop refreshing.
      this.entries = data;
      // Detect changes.
      this.changeDetectionRef.detectChanges();
      // Update loading state.
      this.loading = false;
      // If args exist, then stop refreshing.
      if (args) {
        this.radListView.nativeElement.notifyPullToRefreshFinished();
      }
      // If there is pagination, then activate load on demand.
      if (data.next) {
        this.radListView.nativeElement.loadOnDemandMode = ListViewLoadOnDemandMode.Auto;
      }
    });
  }

  paginate(args: LoadOnDemandListViewEventData): void {
    this.entryService.paginate(this.entries.next)
      .subscribe((data: ApiResponseService<Entry>): void => {
        // Update next and pre URLs.
        this.entries.next = data.next;
        this.entries.previous = data.previous;
        // Push new entries to entries list.
        data.results.map((entry: Entry): void => {
          this.entries.results.push(entry);
        });
        // Complete pagination.
        if (!data.next) {
          this.radListView.nativeElement.loadOnDemandMode = ListViewLoadOnDemandMode.None;
        }
        this.radListView.nativeElement.notifyLoadOnDemandFinished();
      });
  }

  options(entryId: string, index: number): void {
    // Set needed options.
    const actionOptions: ActionOptions = {
      cancelButtonText: 'Cancel',
      actions: ['Edit', 'Delete']
    };
    // Action callback.
    action(actionOptions).then((result: string): void => {
      // If result was 'Delete'.
      if (result === 'Delete') {
        const confirmOptions: ConfirmOptions = {
          title: 'Delete',
          message: 'This action is not reversible. Are you sure?',
          okButtonText: 'Delete',
          cancelButtonText: 'Cancel'
        };

        confirm(confirmOptions).then((result: boolean) => {
          if (result) {
            this.entryService.remove(`website/entry/${entryId}/`).subscribe((): void => {
              // Remove entry from list.
              this.entries.results.splice(index, 1);
              // Detect changes.
              this.changeDetectionRef.detectChanges();
            });
          }
        });
      }
      // If results was 'Edit's
      if (result === 'Edit') {
        this.routerExtensions.navigate(['dash', 'write', entryId]);
      }
    });
  }

  navigateToWrite(args: ListViewEventData) {
    this.routerExtensions.navigate(['dash', 'write', this.entries.results[args.index].id]);
    // this.entries.results[args.index];
  }
}
