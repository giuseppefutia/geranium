import { Injectable } from '@angular/core';
import { Journal } from '../models/journal.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class JournalsService {
// TODO: Change when connecting to server
  // It represents the size of the chunks retrieved from the server (pagination)
  private _blockSize = 4;
  journals = [
    new Journal(
      'JJ1',
      'The Art Of AI',
      '0821-31-333333-1',
      'https://hci-kdd.org/wordpress/wp-content/uploads/2014/11/Journal_of_machine_learning_research.jpg',
      ['AI', 'Neural Networks', 'Deep Learning']
    ),
    new Journal(
      'JJ2',
      'Journal of machine learning',
      '0821-31-33dsa3-1',
      'https://hci-kdd.org/wordpress/wp-content/uploads/2014/11/Journal_of_machine_learning_research.jpg',
      ['AI', 'Machine Learning', 'Deep Learning']
    ),
    new Journal(
      'JJ3',
      'Graphs for life',
      '0788-31-333333-1',
      'https://hci-kdd.org/wordpress/wp-content/uploads/2014/11/Journal_of_machine_learning_research.jpg',
      ['AI', 'Knoledge Graphs', 'Ontologies']
    ),
    new Journal(
      'JJ4',
      'Machine Learning Research',
      '0821-31-333333-1',
      'https://hci-kdd.org/wordpress/wp-content/uploads/2014/11/Journal_of_machine_learning_research.jpg',
      ['Machine Learning', 'Deep Learning']
    )
  ];

  constructor(private http: HttpClient) {}

  get blockSize(): number {
    return this._blockSize;
  }

  getJournalsBlock(query: string, block: number): Journal[] {
    return [...this.journals];
  }

  getJournalFromId(journalId: string) {
    return this.journals.find(journal => journal.id === journalId);
  }

  fetchJournals(query: string) {
    const regex = / /g;
    const request = `PREFIX gpp:<http://geranium-project.org/publications/>
PREFIX gpk:<http://geranium-project.org/keywords/>
PREFIX purl:<http://purl.org/dc/terms/>
PREFIX dbp:<http://dbpedia.org/resource/>
select * where {
    ?publication purl:subject dbp:${query.replace(regex, '_')}
} limit 1000000`;
    this.http
      .get(
        'https://blazegraph.nexacenter.org/blazegraph/sparql?query=' +
          encodeURI('{}')
      )
      .subscribe(resData => {
        console.log(resData);
      });
  }
}
