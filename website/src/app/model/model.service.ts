import { Injectable } from '@angular/core';

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
  private _searchKey: string; // search keyword inserted by the user
  private _prevSearchKey: string //the previously search key inserted by the user
  private _allTopicsInGraph: string[]; // list of all the topics in the graph, retrieved from the api
  private _canSearch: boolean; //status flag: true if the user can perform a search
  private _firstSearch: boolean;

  /**
   * constructor
   */
  constructor() {

    this._searchKey = "";
  }


  /**
   * getters and setters
   */
  set searchKey(searchKey: string) {
    this._searchKey = searchKey;
  }

  get searchKey(): string {
    return this._searchKey;
  }


  set prevSearchKey(prevSearchKey: string) {
    this._prevSearchKey = prevSearchKey;
  }

  get prevSearchKey(): string {
    return this._prevSearchKey;
  }


  set allTopicsInGraph(topics: string[]){
    this._allTopicsInGraph = topics;
  }

  get allTopicsInGraph(): string[]{
    return this._allTopicsInGraph;
  }


  set canSearch(isSearchEnabled: boolean) {
    this._canSearch = isSearchEnabled;
  }

  get canSearch(): boolean {
    return this._canSearch;
  }


  set firstSearch(isFirstSearch: boolean) {
    this._firstSearch = isFirstSearch;
  }

  get firstSearch(): boolean {
    return this._firstSearch;
  }



  /**
   * Model methods
   */
}
