import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthorsService } from '../../services/authors.service';
import { Author } from '../../model/author.model';

@Component({
  selector: 'app-author-detail',
  templateUrl: './author-detail.component.html',
  styleUrls: ['./author-detail.component.scss'],
})
export class AuthorDetailComponent implements OnInit {
  @Input() selectedAuthor: Author;
  isLoading = false;

  constructor(private modalCtrl: ModalController, private authorsService: AuthorsService) { }

  ngOnInit() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }

  onClose() {
    this.modalCtrl.dismiss();
  }
}
