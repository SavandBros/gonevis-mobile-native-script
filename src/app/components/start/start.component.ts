import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'ns-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css'],
  moduleId: module.id,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StartComponent implements OnInit {
  // List of steps
  steps: string[] = ['domain', 'template', 'sign up'];
  // Current step
  step: number = 0;
  // Domain name and data
  domainForm: {
    loading: boolean,
    available: boolean,
    name: string,
    error: any
  };

  myItems = [];

  constructor() {
  }

  ngOnInit(): void {
  }

}
