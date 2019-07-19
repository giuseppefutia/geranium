import { Component, OnInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { Author } from '../../model/author.model';
import { AuthorDetailComponent } from '../author-detail/author-detail.component';
import { ResultsService } from '../../services/results.service';
import { ModelService } from 'src/app/model/model.service';

@Component({
  selector: 'app-authors',
  templateUrl: './authors.page.html',
  styleUrls: ['./authors.page.scss']
})
export class AuthorsPage implements OnInit, AfterContentInit {
  currentBlock = 0;
  maxTopicsPerCard = 4;
  filteredAuthors: Author[] = [];

  isLoading = false;
  isRedirecting = false;
  endOfResults = false;

  constructor(
    private navCtrl: NavController,
    private resultsService: ResultsService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private dataModel: ModelService
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
        this.dataModel.searchKey = paramMap.get('searchKey');
      } else {
        if (this.dataModel.searchKey === '') {
          this.navCtrl.navigateBack(['/search']);
          return;
        } else {
          this.isRedirecting = true;
          this.navCtrl.navigateForward([
            '/',
            'results',
            'tabs',
            'authors',
            this.dataModel.searchKey
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
      .getAuthorsBlock(this.dataModel.searchKey, this.currentBlock)
      .subscribe(newAuthors => {
        this.isLoading = false;

        if (newAuthors.length === 0) {
          this.endOfResults = true;
        } else {
          this.currentBlock++;
        }

        this.filterAuthors();
      });
  }

  /**
   * Filter the topics of interest of each Author
   * @param topics array of the topic of interest
   * @param topicsLimit number of topic to be showed
   */
  processTopics(topics: string[], topicsLimit: number): string[] {
    return topics
      .filter(
        topic => topic.toLowerCase() !== this.dataModel.searchKey.toLowerCase()
      )
      .slice(0, topicsLimit > topics.length ? topics.length : topicsLimit);
  }

  filterAuthors() {
    this.filteredAuthors = this.dataModel.getAuthors();
  }

  openNewTab(url: string) {
    window.open(url, '_blank');
  }

  // Called by infinite scroll to load more data
  onMoreAuthors(event) {
    this.resultsService
      .getAuthorsBlock(this.dataModel.searchKey, this.currentBlock)
      .subscribe(newAuthors => {
        event.target.complete();
        if (newAuthors.length === 0) {
          event.target.disabled = true; // no more results
        } else {
          this.currentBlock++;
        }
      });
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
          if (this.dataModel.searchKey === '') {
            this.navCtrl.navigateBack(['/search']);
            return;
          } else {
            this.isRedirecting = true;
            this.navCtrl.navigateForward([
              '/',
              'results',
              'tabs',
              'authors',
              this.dataModel.searchKey
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
      this.filteredAuthors.push(new Author('', '', '', [''], '', 0));
    }
  }
}
