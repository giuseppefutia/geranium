import { Injectable } from '@angular/core';
import { Paper } from './paper.model';
import { Author, ExpandedAuthor } from './author.model';
import { TopicNoImg, Topic } from './topic.model';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { of, throwError, from } from 'rxjs';
import { SimplifiedPaper } from './paper.model';
import { ConfigService } from '../config/config.service';

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
  private _paperDetails: Paper;

  private _searchStack: TopicNoImg[];
  private _currentAbstract: string;
  private _canSearch: boolean; // status flag: true if the user can perform a search
  private _firstSearch: boolean;

  private _cacheExpirationHours = 0 ;

  /**
   * constructor
   */
  constructor(private http: HttpClient, private config: ConfigService) {
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

        if (
          Date.now() - lastDateMillis >
          1000 * 60 * 60 * this._cacheExpirationHours
        ) {
          localStorage.setItem('lastDateMillis', JSON.stringify(Date.now()));
          return this.fetchTopics();
        } else {
          this._allTopicsInGraph = JSON.parse(
            localStorage.getItem('topicsCache')
          );
          this.canSearch = true;
          return from([[{ url: 'fake', label: 'fake' }]]);
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
      'https://' +
      this.config.apiDomain + ':' + this.config.apiPort +
      '/api?' +
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
          localStorage.setItem(
            'topicsCache',
            JSON.stringify(this._allTopicsInGraph)
          );
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
      'https://' +
      this.config.apiDomain + ':' + this.config.apiPort +
      '/api?' +
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


  /* PAPERS */
  addPaper(newPaper: Paper) {
    this._retrievedPapers.push(newPaper);
  }

  addAllPapers(newPapers: Paper[]) {
    this._retrievedPapers = this._retrievedPapers.concat(newPapers);
  }

  paperID2URI(id: string) {
    return 'http://geranium-project.org/publications/' + id.replace('-', '/');
  }

  paperURI2ID(uri: string) {
    return uri.split('publications/')[1].replace('/', '-');
  }

  findPaperFromID(id: string): Paper {
    return this._retrievedPapers.find(p => p.id === id);
  }

  getPaperDetails() {
    return this._paperDetails;
  }

  setPaperDetails(paper: Paper) {
    this._paperDetails = paper;
  }

  /* AUTHORS */
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

  getInitials(name: string): string {
    const names = name.split(' ');
    return names[0].charAt(0) + names[names.length - 2].charAt(0);
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

  getAuthorURLFromID(authorID: string) {
    return 'http://geranium-project.org/authors/' + authorID;
  }

  getIRISUrl(paper: SimplifiedPaper): string {
    return 'https://iris.polito.it/handle/' + paper.id.replace('-', '/');
  }

  cleanID(dirty: string) {
    return dirty.replace('/', '-');
  }

  mergeArraysRightPriority(
    l: Array<SimplifiedPaper>,
    r: Array<SimplifiedPaper>
  ) {
    let i = 0,
      j = 0,
      cnt = 0;
    const old = [...l];
    while (i < old.length) {
      const paper = r[j];
      if (old[i].id !== paper.id) {
        l.splice(cnt, 0, paper);
        cnt++;
      } else {
        i++;
        cnt++;
      }
      j++;
    }
    for (; j < r.length; j++) {
      const paper = r[j];
      l.splice(cnt, 0, paper);
      cnt++;
    }
  }
}

