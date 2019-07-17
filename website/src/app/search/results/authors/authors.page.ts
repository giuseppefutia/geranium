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
  searchKey: string;
  currentBlock = 0;
  allAuthors: Author[] = [];
  maxTopicsPerCard = 4;

  isLoading = false;
  isRedirecting = false;
  endOfResults = false;

  constructor(
    private navCtrl: NavController,
    private resultsService: ResultsService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController
  ) {}

  /**
   * Initialization of the component
   */
  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('authorId')) {
        this.isRedirecting = true;
        this.onAuthorDetails(
          this.resultsService.getAuthorFromId(paramMap.get('authorId'))
        );
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

  /**
   * After component is initialized, fetch data from server
   */
  ngAfterContentInit() {
    if (!this.isRedirecting) {
      this.fetchData();
    }
  }

  /**
   * Get data from backend and add them to the collection
   */
  fetchData() {
    this.isLoading = true;
    this.addDummySlides(10);

    this.resultsService
      .getAuthorsBlock(this.searchKey, this.currentBlock)
      .subscribe(newAuthors => {
        this.allAuthors = [];
        this.isLoading = false;

        if (newAuthors.length === 0) {
          this.endOfResults = true;
        } else {
          for (const newAuthor of newAuthors) {
            newAuthor.topics = this.filterTopics(
              newAuthor.topics,
              this.maxTopicsPerCard
            );
            this.allAuthors.push(newAuthor);
          }
          this.currentBlock++;
        }
      });
  }

  /**
   * Filter the topics of interest of each Author
   * @param topics array of the topic of interest
   * @param topicsLimit number of topic to be showed
   */
  filterTopics(topics: string[], topicsLimit: number): string[] {
    return topics
      .filter(topic => topic.toLowerCase() !== this.searchKey.toLowerCase())
      .slice(0, topicsLimit > topics.length ? topics.length : topicsLimit);
  }

  /**
   * Get more authors to be showed, scrolling
   */
  fetchMoreData() {
    this.resultsService
      .getAuthorsBlock(this.searchKey, this.currentBlock)
      .subscribe(newAuthors => {
        if (newAuthors.length === 0) {
          this.endOfResults = true; // no more results
        } else {
          for (const newAuthor of newAuthors) {
            newAuthor.topics = this.filterTopics(
              newAuthor.topics,
              this.maxTopicsPerCard
            );
            this.allAuthors.push(newAuthor);
          }
          this.currentBlock++;
        }
      });
  }

  openNewTab(url: string) {
    window.open(url, '_blank');
  }

  // Called by infinite scroll to load more data
  onMoreAuthors(event) {
    setTimeout(() => {
      this.fetchMoreData();
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
      this.allAuthors.push(new Author('', '', '', [''], '', 0));
    }
  }
}
