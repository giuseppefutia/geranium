import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router} from '@angular/router';
import { PapersService } from './services/papers.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss']
})
export class SearchPage implements OnInit {
  constructor(private router: Router, private papersService: PapersService) { }

  ngOnInit() {}

  ionViewDidEnter() {
    this.papersService.searchKey = '';
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    this.papersService.searchKey = form.value.searchkey;
    this.router.navigate(['/', 'results', 'tabs', 'papers']);
  }
}
