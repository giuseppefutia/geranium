import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResultsService } from '../../services/results.service';
import { ModelService } from '../../model/model.service';
import { TopicNoImg } from 'src/app/model/topic.model';

/**
 * Landing page component
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss']
})
export class SearchPage implements OnInit {
  /**
   * local attributes of the component
   */
  public expand = 'retracted'; // autocompletion view status
  private minLettersSuggestions = 2;
  public searchSuggestions: TopicNoImg[] = [];
  searchTopicString = '';

  /**
   * Constructor
   * @param router in charge of routing between pages
   * @param resultsService in charge of querying the API
   * @param dataModel in charge of maintaining the model of the application
   */
  constructor(
    private router: Router,
    private resultsService: ResultsService,
    public dataModel: ModelService
  ) {}

  /**
   * After component is initialized, get the list of all topics contained in the graph, used for autocompletion
   */
  ngOnInit() {}

  /**
   * Display hints on possible search queries to the user
   */
  displaySuggestions() {
    if (this.searchTopicString.length >= this.minLettersSuggestions) {
      // enough letters, display suggestions

      const r = new RegExp(this.searchTopicString, 'gi');
      this.searchSuggestions = this.dataModel.allTopicsInGraph
        .filter(s => s.label.search(r) !== -1)
        .sort((a, b) => a.label.length - b.label.length);
    } else if (
      this.searchTopicString.length >= 1 &&
      this.searchTopicString.length < this.minLettersSuggestions
    ) {
      // not enough letters, inform user of minimum number of letters

      this.searchSuggestions = [
        {
          label:
            'Inserisci almeno ' +
            this.minLettersSuggestions +
            ' lettere per ottenere suggerimenti',
          url: '',
          wikiUrl: ''
        }
      ];
    } else {
      this.searchSuggestions = [];
    }
  }

  countInSuggestions(label: string) {
    return this.searchSuggestions.filter(p => p.label === label).length;
  }

  /**
   * callback executed when the user confirms his input, navigates to new components in charge of displaying the results
   *
   * @param searchKey user inserted input, the search key
   */
  navigate(searchTopic: TopicNoImg) {
    this.dataModel.searchTopic = searchTopic; // set search key in Model

    this.router.navigate([
      '/',
      'results',
      'tabs',
      'papers',
      this.dataModel.searchTopic.label
    ]);
  }

  /**
   *
   */
  addFocus() {
    this.expand = 'expanded'; // expand autocompletion

    if (this.searchTopicString !== '') {
      this.displaySuggestions();
    }
  }

  /**
   *
   */
  removeFocus() {
    if (this.searchTopicString === '') {
      this.expand = 'retracted';
    }
  }
}
