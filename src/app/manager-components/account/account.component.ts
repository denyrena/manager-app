import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  @Input()
  account: any;

  constructor() { }

  ngOnInit(): void {
  }

}
