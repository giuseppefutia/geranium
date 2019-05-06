import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ResultsService } from '../../services/results.service';
import { Author } from '../../models/author.model';

@Component({
  selector: 'app-author-detail',
  templateUrl: './author-detail.component.html',
  styleUrls: ['./author-detail.component.scss'],
})
export class AuthorDetailComponent implements OnInit {
  @Input() authorId: string;
  selectedAuthor: Author;
  isLoading = false;

  constructor(private modalCtrl: ModalController, private resultsService: ResultsService) { }

  ngOnInit() {
    this.isLoading = true;
    this.selectedAuthor = this.resultsService.getAuthorFromId(this.authorId);
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }

  onClose() {
    this.modalCtrl.dismiss();
  }
}
