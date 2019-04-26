import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Key } from 'protractor';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss']
})
export class SearchPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const searchKey = form.value.searchkey;
    this.router.navigate(['/', 'results', searchKey]);
  }
}
