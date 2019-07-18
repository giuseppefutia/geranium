import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResultsService } from '../../services/results.service';
import { ModelService } from '../../model/model.service';


/**
 * Landing page component
 */
@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss']
})
export class SearchPage implements OnInit{

  /**
   * local attributes of the component
   */
  public expand = 'retracted'; // autocompletion view status
  private minLettersSuggestions = 4;
  private searchSuggestions: string[] = []

  /**
   * Constructor
   * @param router in charge of routing between pages
   * @param resultsService in charge of querying the API
   * @param dataModel in charge of maintaining the model of the application
   */
  constructor(private router: Router, private resultsService: ResultsService, private dataModel: ModelService) {}

  /**
   * After component is initialized, get the list of all topics contained in the graph, used for autocompletion
   */
  ngOnInit(){

    this.resultsService.getAllTopics().subscribe(
      topics => {
        this.dataModel.allTopicsInGraph = topics;
        this.dataModel.canSearch = true;
      }
    );
  }

  /**
   * Display hints on possible search queries to the user
   */
  displaySuggestions() {

    if (this.dataModel.prevSearchKey !== this.dataModel.searchKey) {
      this.dataModel.prevSearchKey = this.dataModel.searchKey;

      if (this.dataModel.searchKey.length >= this.minLettersSuggestions) {
        // enough letters, display suggestions

        const r = new RegExp(this.dataModel.searchKey, 'gi');
        this.searchSuggestions = this.dataModel.allTopicsInGraph
          .filter(s => s.search(r) !== -1)
          .sort((a, b) => a.length - b.length);
      
      } else if (this.dataModel.searchKey.length >= 1 && this.dataModel.searchKey.length < this.minLettersSuggestions) {
        // not enough letters, inform user of minimum number of letters

        this.searchSuggestions = [
          'Inserisci almeno ' +
          this.minLettersSuggestions +
          ' lettera per ottenere suggerimenti'
        ];
      
      } else {
        this.searchSuggestions = [];
      }
    }
  }

  /**
   * callback executed when the user confirms his input, navigates to new components in charge of displaying the results
   * 
   * @param searchKey user inserted input, the search key
   */
  navigate(searchKey: string) {

    this.dataModel.searchKey = searchKey; // set search key in Model

    this.router.navigate([
      '/',
      'results',
      'tabs',
      'papers',
      this.dataModel.searchKey
    ]);
  }

  /**
   * 
   */
  addFocus() {

    this.expand = 'expanded'; //expand autocompletion
    
    if (this.dataModel.searchKey !== '')
      this.displaySuggestions();
  }

  /**
   * 
   */
  removeFocus() {
    
    if (this.dataModel.searchKey === '')
        this.expand = 'retracted';
  }
}
