import { Injectable } from '@angular/core';
import { PapersService } from './papers.service';
import { AuthorsService } from './authors.service';
import { JournalsService } from './journals.service';
import { SimplifiedPaper } from '../model/simplified-paper.model';
import { Paper } from '../model/paper.model';
import { Author } from '../model/author.model';
import { Journal } from '../model/journal.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  private prevKey = '';
  private _searchKey = '';
  private searchCount = 0;
  private _firstSearch = true;

  constructor(
    private papersService: PapersService,
    private authorsService: AuthorsService,
    private journalsService: JournalsService,
    private http: HttpClient
  ) {}

  get journalsBlockSize(): number {
    return this.journalsService.blockSize;
  }
  get isFirstSearch(): boolean {
    return this._firstSearch;
  }
  get searchKey(): string {
    return this._searchKey;
  }
  set searchKey(key: string) {
    if (key !== this.prevKey) {
      this._searchKey = key;
      this.searchCount++;
      if (this.searchCount > 1) {
        this._firstSearch = false;
      }
    }
  }

  getAllTopics() {
    const url = 'http://api.geranium.nexacenter.org/api?'
              + encodeURI(`type=topics&lines=100000&offset=0`);
    return this.http.get<string[]>(url);
  }

  getSimplifiedPapersBlock(query: string, block: number) {
    return this.papersService.getSimplifiedPapersBlock(query, block);
  }

  getPaperFromId(id: string): Paper {
    return this.papersService.getPaperFromId(id);
  }

  // call service to request the author data
  getAuthorsBlock(query: string, block: number) : Observable<Author[]> {
    return this.authorsService.getAuthorsBlock(query, block);
  }

  getAuthorFromId(authorId: string) {
    return this.authorsService.getAuthorFromId(authorId);
  }

  getJournalsBlock(query: string, block: number): Journal[] {
    return this.journalsService.getJournalsBlock(query, block);
  }

  getJournalFromId(journalId: string) {
    return this.journalsService.getJournalFromId(journalId);
  }
}
