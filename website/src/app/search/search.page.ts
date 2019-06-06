import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router} from '@angular/router';
import { PapersService } from './services/papers.service';
import { ResultsService } from './services/results.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss']
})
export class SearchPage implements OnInit {
  constructor(private router: Router, private resultsService: ResultsService) { }

  ngOnInit() {}

  ionViewDidEnter() {
    this.resultsService.searchKey = '';
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    this.resultsService.searchKey = form.value.searchkey;
    this.router.navigate(['/', 'results', 'tabs', 'papers', this.resultsService.searchKey]);
  }
}
