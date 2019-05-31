import { Component, OnInit, Input } from '@angular/core';
import { Paper } from '../../models/paper.model';
import { ModalController, NavController } from '@ionic/angular';
import { PapersService } from '../../services/papers.service';
import { SimplifiedAuthor } from '../../models/simplified-author.model';
import { AuthorDetailComponent } from '../author-detail/author-detail.component';
import { ResultsService } from '../../services/results.service';

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
    private papersService: PapersService,
    private resultsService: ResultsService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.selectedPaper = this.papersService.getPaperFromId(
      this.selectedPaperId
    );
  }

  onAuthorChipClick(author: SimplifiedAuthor) {
    this.navCtrl.navigateForward(['/', 'results', 'tabs', 'authors', 'author', author.id]);
  }

  onTopicChipClick(topic: string) {
    this.resultsService.searchKey = topic;
    this.navCtrl.navigateForward(['/', 'results', 'tabs', 'papers', topic]);
    this.onClose();
  }

  onClose() {
    this.modalCtrl.dismiss(null, 'close');
  }
}
