import { Component, OnInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page';

@Component({
  selector: 'ns-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.css'],
  moduleId: module.id,
})
export class DashComponent implements OnInit {

  constructor(private page: Page) {
    page.actionBarHidden = true;
  }

  ngOnInit() {
  }
}
