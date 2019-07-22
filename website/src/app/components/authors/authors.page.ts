import { Component, OnInit } from '@angular/core';
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
export class AuthorsPage implements OnInit {
  currentBlock = 0;
  maxTopicsPerCard = 4;
  filteredAuthors: Author[] = [];

  isLoading = false;
  isRedirecting = false;
  endOfResults = false;

  private firstTime: boolean;

  constructor(
    private navCtrl: NavController,
    private resultsService: ResultsService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private dataModel: ModelService
  ) {
    this.firstTime = true;
  }

  /**
   * Initialization of the component
   */
  ngOnInit() {
    this.isLoading = true;
    this.addDummySlides(10);
    this.route.paramMap.subscribe(paramMap => {
      if (paramMap.has('authorId')) {
        this.isRedirecting = true;

        // Show author details modal if authorId present in URL
        this.onAuthorDetails(
          this.resultsService.getAuthorFromId(paramMap.get('authorId'))
        );
        return;
      }
      if (paramMap.has('searchKey')) {
        this.dataModel
          .searchTopicFromString(paramMap.get('searchKey'))
          .subscribe(r => {
            if (this.firstTime) {
              this.fetchData();
              this.firstTime = false;
            }
          });
      } else {
        if (this.dataModel.searchTopicToString() === '') {
          this.navCtrl.navigateBack(['/search']);
          return;
        } else {
          this.isRedirecting = true;
          this.navCtrl.navigateForward([
            '/',
            'results',
            'tabs',
            'authors',
            this.dataModel.searchTopicToString()
          ]);
        }
      }
    });
  }

  /**
   * Get data from backend and add them to the collection
   */
  fetchData() {
     this.resultsService
      .getAuthorsBlock(this.dataModel.searchTopic, this.currentBlock)
      .subscribe(newAuthors => {
        this.isLoading = false;

        if (newAuthors.length === 0) {
          this.endOfResults = true;
        } else {
          this.currentBlock++;
          this.filterAuthors();
        }

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
        topic => topic.toLowerCase() !== this.dataModel.searchTopicToString().toLowerCase()
      )
      .slice(0, topicsLimit > topics.length ? topics.length : topicsLimit);
  }

  filterAuthors() {
    this.filteredAuthors = this.dataModel.getAuthors();
  }

  openTopicUrl() {
    if (!this.isLoading) {
      window.open(this.dataModel.topicWikiUrl, '_blank');
    }
  }

  // Called by infinite scroll to load more data
  onMoreAuthors(event) {
    this.resultsService
      .getAuthorsBlock(this.dataModel.searchTopic, this.currentBlock)
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
          if (this.dataModel.searchTopicToString() === '') {
            this.navCtrl.navigateBack(['/search']);
            return;
          } else {
            this.isRedirecting = true;
            this.navCtrl.navigateForward([
              '/',
              'results',
              'tabs',
              'authors',
              this.dataModel.searchTopicToString()
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
