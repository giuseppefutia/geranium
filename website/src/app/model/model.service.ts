import { Injectable } from '@angular/core';
import { Paper } from './paper.model';
import { Author, ExpandedAuthor } from './author.model';
import { TopicNoImg, Topic } from './topic.model';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, from } from 'rxjs';
import { SimplifiedPaper } from './simplified-paper.model';

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
  private _allTopicsInGraph: TopicNoImg[]; // list of all the topics in the graph, retrieved from the api

  private _retrievedPapers: Paper[] = [];
  private _retrievedAuthors: Author[] = [];
  private _authorDetails: ExpandedAuthor;

  private _searchStack: TopicNoImg[];
  private _currentAbstract: string;
  private _canSearch: boolean; // status flag: true if the user can perform a search
  private _firstSearch: boolean;

  private _cacheExpirationHours = 24;

  /**
   * constructor
   */
  constructor(private http: HttpClient) {
    this._retrievedAuthors = [];
    this._retrievedPapers = [];
    this._searchStack = [];
  }

  /**
   * getters and setters
   */
  set searchTopic(searchTopic: TopicNoImg) {
    if (this._searchStack.length === 0) {
      this.emptyPrevResults();
      this._searchStack.push(searchTopic);
      this._firstSearch = true;
    } else {
      if (searchTopic.label !== this.searchTopic.label) {
        this.emptyPrevResults();
        this._searchStack.push(searchTopic);
        this._firstSearch = false;
      }
    }
  }

  get searchTopic(): TopicNoImg {
    return this._searchStack[this._searchStack.length - 1];
  }

  popSearchState(): TopicNoImg {
    return this._searchStack.pop();
  }

  getSearchStackLength(): number {
    return this._searchStack.length;
  }

  getAllTopics() {
    if (window.localStorage) {
      // Checks if it is supported by browser
      if (
        localStorage.getItem('lastDateMillis') !== null &&
        localStorage.getItem('topicsCache') !== null
      ) {
        const lastDateMillis = JSON.parse(
          localStorage.getItem('lastDateMillis')
        ) as number;

        if (Date.now() - lastDateMillis > 1000 * 60 * 60 * this._cacheExpirationHours) {
          localStorage.setItem('lastDateMillis', JSON.stringify(Date.now()));
          return this.fetchTopics();
        } else {
          this._allTopicsInGraph = JSON.parse(localStorage.getItem('topicsCache'));
          this.canSearch = true;
          return from([[{url: 'fake', label: 'fake'}]]);
        }
      } else {
        localStorage.clear();
        localStorage.setItem('lastDateMillis', JSON.stringify(Date.now()));
        return this.fetchTopics();
      }
    } else {
      return this.fetchTopics();
    }
  }

  fetchTopics() {
    const url =
      'http://api.geranium.nexacenter.org/api?' +
      encodeURI(`type=topics&lines=100000&offset=0`);
    return this.http.get<{ url: string; label: string }[]>(url).pipe(
      tap(result => {
        this._allTopicsInGraph = [];
        for (const topic of result.sort(
          (a, b) => a.label.length - b.label.length
        )) {
          this._allTopicsInGraph.push(
            new TopicNoImg(topic.url, this.getWikiUrl(topic.url), topic.label)
          );
        }
        if (window.localStorage) {
          localStorage.setItem('topicsCache', JSON.stringify(this._allTopicsInGraph));
        }
        this.canSearch = true;
      })
    );
  }

  get currentTopicAbstract(): string {
    return this._currentAbstract;
  }

  getAbstract() {
    const url =
      'http://api.geranium.nexacenter.org/api?' +
      encodeURI(`type=abstract&topic=${this.searchTopic.url}`);
    return this.http.get<string>(url).pipe(
      tap(result => {
        this._currentAbstract = result;
      })
    );
  }

  searchTopicFromString(topicString: string) {
    if (this.allTopicsInGraph === undefined) {
      return this.getAllTopics().pipe(
        tap(r => {
          const topic = this.allTopicsInGraph.find(
            s => s.label === topicString
          );
          this.searchTopic = topic;
          console.log(topic);
          if (topic === undefined) {
            throw throwError('Invalid search topic');
          }
        })
      );
    }
    const topic = this.allTopicsInGraph.find(s => s.label === topicString);
    this.searchTopic = topic;

    // Fake observable to subscribe to
    return of([topic]);
  }

  searchTopicToString(): string {
    return this.searchTopic.label;
  }

  getWikiUrl(url: string): string {
    const parts = url.split('/');
    return 'en.wikipedia.org/wiki/' + parts[parts.length - 1];
  }

  set allTopicsInGraph(topics: TopicNoImg[]) {
    this._allTopicsInGraph = topics;
  }

  get allTopicsInGraph(): TopicNoImg[] {
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

  findPaperFromId(id: string): Paper {
    return this._retrievedPapers.find(p => p.id === id);
  }

  getAuthorDetails() {
    return this._authorDetails;
  }

  setAuthorDetails(authorDetails: ExpandedAuthor) {
    this._authorDetails = authorDetails;
  }

  getPapersCount(): number {
    return this._retrievedPapers.length;
  }

  getRetrievedPapers(): Paper[] {
    return [...this._retrievedPapers];
  }

  addAuthor(newAuthor: Author) {
    this._retrievedAuthors.push(newAuthor);
  }

  addAllAuthors(newAuthors: Author[]) {
    this._retrievedAuthors = this._retrievedAuthors.concat(newAuthors);
  }

  getRetrievedAuthors(): Author[] {
    return [...this._retrievedAuthors];
  }

  emptyAuthors() {
    this._retrievedAuthors = [];
  }

  emptyPrevResults() {
    this.emptyAuthors();
    this._retrievedPapers = [];
  }

  shortenAuthorName(name: string): string {
    let builder = '';
    let i: number;
    if (name.search(/,/g) !== -1) {
      const names_ = name.split(',');
      name = names_[1].trim() + ' ' + names_[0].trim();
    } else {
      if (name.search(/\./g) !== -1) {
        return name;
      }
    }
    const names = name.split(' ');
    for (i = 0; i < names.length - 1; i++) {
      builder += names[i].charAt(0).toUpperCase() + '. ';
    }
    let first = names[i].toLowerCase();
    first = first.charAt(0).toUpperCase() + first.slice(1);
    builder += first;
    return builder;
  }

  normalizeAuthorName(name: string): string {
    let newName;
    let builder = '';
    let i: number;
    if (name.search(/,/g) === -1) {
      if (name.search(/\./g) !== -1) {
        return name;
      }
      newName = name;
    } else {
      const names_ = name.split(',');
      newName = names_[1].trim() + ' ' + names_[0].trim();
    }
    const names = newName.split(' ');
    for (i = 0; i < names.length; i++) {
      builder +=
        names[i].charAt(0).toUpperCase() +
        names[i].substring(1).toLowerCase() +
        ' ';
    }
    return builder;
  }

  getIRISUrl(paper: SimplifiedPaper): string {
    return 'https://iris.polito.it/handle/' + paper.id.replace('-', '/');
  }

  cleanID(dirty: string) {
    return dirty.replace('/', '-');
  }
}
