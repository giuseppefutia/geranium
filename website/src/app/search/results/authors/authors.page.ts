import { Component, OnInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { Author } from '../../models/author.model';
import { AuthorDetailComponent } from '../author-detail/author-detail.component';
import { ResultsService } from '../../services/results.service';

@Component({
  selector: 'app-authors',
  templateUrl: './authors.page.html',
  styleUrls: ['./authors.page.scss']
})
export class AuthorsPage implements OnInit, AfterContentInit {
  currentBlock = 0;

  searchKey: string;
  allAuthors: Author[] = [];

  isLoading = false;
  isRedirecting = false;
  endOfResults = false;

  constructor(
    private navCtrl: NavController,
    private resultsService: ResultsService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('authorId')) {
        this.isRedirecting = true;
        this.onAuthorDetails(this.resultsService.getAuthorFromId(paramMap.get('authorId')));
        return;
      }
      if (paramMap.has('searchKey')) {
        this.searchKey = paramMap.get('searchKey');
        this.resultsService.searchKey = this.searchKey;
      } else {
        if (this.resultsService.searchKey === '') {
          this.navCtrl.navigateBack(['/search']);
          return;
        } else {
          this.searchKey = this.resultsService.searchKey;
          this.isRedirecting = true;
          this.navCtrl.navigateForward([
            '/',
            'results',
            'tabs',
            'authors',
            this.searchKey
          ]);
        }
      }
    });
  }

  ngAfterContentInit() {
    if (!this.isRedirecting) {
      this.fetchData();
    }
  }

  fetchData() {
    this.isLoading = true;
    this.addDummySlides(10);
    setTimeout(() => {
      this.isLoading = false;
      this.allAuthors = [];
      this.addToShowedAuthors(10);
    }, 2000);
  }

  filterTopics(topics: string[], topicsLimit: number): string[] {
    return topics
      .filter(topic => topic.toLowerCase() !== this.searchKey.toLowerCase())
      .slice(0, topicsLimit > topics.length ? topics.length : topicsLimit);
  }

  // Add papers that will actually be shown in the grid
  addToShowedAuthors(atleast: number) {
    const maxTopicsPerCard = 4;
    const oldAll = this.allAuthors.length;
    while (1) {
      const temp = this.resultsService.getAuthorsBlock(
        this.searchKey,
        this.currentBlock
      );
      if (temp.length === 0) {
        // If there are no results
        this.endOfResults = true;
        break;
      }
      for (const newAuthor of temp) {
        newAuthor.topics = this.filterTopics(
          newAuthor.topics,
          maxTopicsPerCard
        );
        this.allAuthors.push(newAuthor);
      }
      this.currentBlock++;

      if (temp.length !== this.resultsService.authorsBlockSize) {
        // If the length of the results of the last block
        // is not the size of a block, than results have ended
        // which in turn disables the infinite-scroll
        this.endOfResults = true;
        break;
      }
      if (this.allAuthors.length - oldAll >= atleast) {
        break;
      }
    }
  }

  openNewTab(url: string) {
    window.open(url, '_blank');
  }

  // Called by infinite scroll to load more data
  onMoreAuthors(event) {
    setTimeout(() => {
      this.addToShowedAuthors(10);
      event.target.complete();

      // disable the infinite scroll
      if (this.endOfResults === true) {
        event.target.disabled = true;
      }
    }, 1500);
  }

  // Open modal when clicked on MORE in a card
  onAuthorDetails(author: Author) {
    this.modalCtrl
      .create({
        component: AuthorDetailComponent,
        componentProps: { selectedAuthor: author }
      })
      .then(modalEl => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then(result => {
        if (this.isRedirecting) {
          if (this.resultsService.searchKey === '') {
            this.navCtrl.navigateBack(['/search']);
            return;
          } else {
            this.searchKey = this.resultsService.searchKey;
            this.isRedirecting = true;
            this.navCtrl.navigateForward([
              '/',
              'results',
              'tabs',
              'authors',
              this.searchKey
            ]);
          }
        }
      });
  }

  // Called when top button is clicked -> returns to search page
  onBackClick() {
    this.navCtrl.navigateBack(['/', 'search']);
  }

  // Adds dummy slides while fetching data
  addDummySlides(howmany: number) {
    let i: number;
    for (i = 0; i < howmany; i++) {
      this.allAuthors.push(
        new Author(
          '',
          '',
          '',
          [''],
          '',
          0
        )
      );
    }
  }
}
