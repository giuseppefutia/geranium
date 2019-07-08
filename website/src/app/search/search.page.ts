import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResultsService } from './services/results.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss']
})
export class SearchPage implements OnInit {
  public searchKey = '';
  public results: string[] = [];
  private allTopics: string[];
  public canSearch = false;

  constructor(private router: Router, private resultsService: ResultsService) {}

  ngOnInit() {}

  ionViewDidEnter() {
    this.resultsService.searchKey = '';
    this.resultsService.getAllTopics().subscribe(topics => {
      this.allTopics = topics;
      this.canSearch = true;
    });
  }

  search() {
    if (this.searchKey.length >= 4) {
      const r = new RegExp(this.searchKey, 'gi');
      this.results = this.allTopics
        .filter(s => s.search(r) !== -1)
        .sort((a, b) => a.length - b.length);
    } else {
      this.results = [];
    }
  }

  navigate(key: string) {
    this.resultsService.searchKey = key;
    this.router.navigate([
      '/',
      'results',
      'tabs',
      'papers',
      this.resultsService.searchKey
    ]);
  }

  // onSubmit(form: NgForm) {
  //   if (!form.valid) {
  //     return;
  //   }
  //   this.resultsService.searchKey = form.value.searchkey;
  //   this.router.navigate(['/', 'results', 'tabs', 'papers', this.resultsService.searchKey]);
  // }
}
