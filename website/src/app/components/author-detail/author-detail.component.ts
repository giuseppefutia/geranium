import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Author } from '../../model/author.model';
import { ResultsService } from 'src/app/services/results.service';

@Component({
  selector: 'app-author-detail',
  templateUrl: './author-detail.component.html',
  styleUrls: ['./author-detail.component.scss'],
})
export class AuthorDetailComponent implements OnInit {
  @Input() selectedAuthorURI: string;
  @input() se
  selectedAuthor: ExpandedAuthor;
  isLoading = false;

  constructor(private modalCtrl: ModalController, private resultsService: ResultsService) {
    this.isLoading = true;
  }

  ngOnInit() {
    this.selectedAuthor = this.resultsService.getAuthorFromURI(this.selectedAuthorURI);
    this.isLoading = false;
  }

  onClose() {
    this.modalCtrl.dismiss();
  }
}
