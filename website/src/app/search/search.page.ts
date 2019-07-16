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
  private prevKey = '';
  public results: string[] = [];
  private allTopics: string[];
  public canSearch = false;
  public expand = 'retracted';

  private minLettersSuggestions = 4;

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
    if (this.prevKey !== this.searchKey) {
      this.prevKey = this.searchKey;
      if (this.searchKey.length >= this.minLettersSuggestions) {
        const r = new RegExp(this.searchKey, 'gi');
        this.results = this.allTopics
          .filter(s => s.search(r) !== -1)
          .sort((a, b) => a.length - b.length);
      } else if (
        this.searchKey.length >= 1 &&
        this.searchKey.length < this.minLettersSuggestions
      ) {
        this.results = [
          'Inserisci almeno ' +
            this.minLettersSuggestions +
            ' lettere per suggerimenti'
        ];
      } else {
        this.results = [];
      }
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

  addFocus() {
    this.expand = 'expanded';
    if (this.searchKey !== '') {
      this.search();
    }
  }

  removeFocus() {
    setTimeout(() => {
      if (this.searchKey === '') {
        this.expand = 'retracted';
      }
    }, 320);
  }
}
