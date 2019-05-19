import { Component, OnInit, Input } from '@angular/core';
import { Paper } from '../../models/paper.model';
import { ModalController } from '@ionic/angular';
import { PapersService } from '../../services/papers.service';
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

  constructor(
    private modalCtrl: ModalController,
    private papersService: PapersService
  ) {}

  ngOnInit() {
    this.selectedPaper = this.papersService.getPaperFromId(
      this.selectedPaperId
    );
  }

  onAuthorChipClick(author: SimplifiedAuthor) {
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
