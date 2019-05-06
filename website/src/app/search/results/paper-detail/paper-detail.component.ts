import { Component, OnInit, Input } from '@angular/core';
import { Paper } from '../../models/paper.model';
import { ModalController } from '@ionic/angular';
import { ResultsService } from '../../services/results.service';
import { SimplifiedAuthor } from '../../models/simplified-author.model';
import { AuthorDetailComponent } from '../author-detail/author-detail.component';

@Component({
  selector: 'app-paper-detail',
  templateUrl: './paper-detail.component.html',
  styleUrls: ['./paper-detail.component.scss']
})
export class PaperDetailComponent implements OnInit {
  @Input() selectedPaperId: string;
  selectedPaper: Paper;

  authorsOpts = {
    zoom: false,
    slidesPerView: 4.5,
    grabCursor: true,
    centeredSlides: false,
    breakpoints: {
      600: {
        slidesPerView: 2.5
      },
      1000: {
        slidesPerView: 3.5
      }
    }
  };

  constructor(
    private modalCtrl: ModalController,
    private resultsService: ResultsService
  ) {}

  ngOnInit() {
    this.selectedPaper = this.resultsService.getPaperFromId(
      this.selectedPaperId
    );
  }

  onAuthorSlideClick(author: SimplifiedAuthor) {
    this.modalCtrl
      .create({
        component: AuthorDetailComponent,
        componentProps: { authorId: author.id },
        showBackdrop: false
      })
      .then(modalEl => {
        modalEl.present();
      });
  }

  onClose() {
    this.modalCtrl.dismiss(null, 'close');
  }
}
