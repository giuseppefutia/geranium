import { Injectable } from '@angular/core';
import { Paper } from './paper.model';

/**
 * This service describes and contains the **model** of the application
 */
@Injectable({
  providedIn: 'root'
})
export class ModelService {

  /**
   * Model data
   */
  private _allTopicsInGraph: string[]; // list of all the topics in the graph, retrieved from the api

  private _retrievedPapers: Paper[] = [];

  private _searchKey: string; // search keyword inserted by the user
  private _prevSearchKey: string // the previously search key inserted by the user
  private _canSearch: boolean; // status flag: true if the user can perform a search
  private _firstSearch: boolean;
  private _searchCount = 0;

  /**
   * constructor
   */
  constructor() {
    this._searchKey = '';
    this._prevSearchKey = '';
  }


  /**
   * getters and setters
   */
  set searchKey(searchKey: string) {
    if (searchKey !== this._prevSearchKey) {
      this._prevSearchKey = this._searchKey;
      this._searchKey = searchKey;
      this._searchCount++;
      if (this._searchCount > 1) {
        this._firstSearch = false;
      }
    }
  }

  get searchKey(): string {
    return this._searchKey;
  }

  get prevSearchKey(): string {
    return this._prevSearchKey;
  }

  set allTopicsInGraph(topics: string[]) {
    this._allTopicsInGraph = topics;
  }

  get allTopicsInGraph(): string[] {
    return this._allTopicsInGraph;
  }


  set canSearch(isSearchEnabled: boolean) {
    this._canSearch = isSearchEnabled;
  }

  get canSearch(): boolean {
    return this._canSearch;
  }

  get firstSearch(): boolean {
    return this._firstSearch;
  }


  addPaper(newPaper: Paper) {
    this._retrievedPapers.push(newPaper);
  }

  addAllPapers(newPapers: Paper[]) {
    this._retrievedPapers = this._retrievedPapers.concat(newPapers);
  }

  getPaperFromId(id: string): Paper {
    return this._retrievedPapers.find(p => p.id === id);
  }

  getPapersCount(): number {
    return this._retrievedPapers.length;
  }

  getPapers(): Paper[] {
    return this._retrievedPapers;
  }
}
