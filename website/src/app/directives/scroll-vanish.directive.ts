import { Directive, Input, ElementRef, Renderer2, OnInit } from '@angular/core';
import { DomController } from '@ionic/angular';

@Directive({
  selector: '[myScrollVanish]'
})
export class ScrollVanishDirective implements OnInit {
  @Input('myScrollVanish') scrollArea;
  @Input('myHeaderMaxHeight') headerMaxHeight;

  private hidden = false;
  private triggerDistance = 20;
  private maxHeight: number;

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private domCtrl: DomController
  ) { }

  ngOnInit() {
    this.initStyles();
    const temp = this.headerMaxHeight as string;
    if (temp.endsWith('px')) {
      this.maxHeight = Number.parseInt(temp.slice(0, -2), 10);
    }

    this.scrollArea.ionScroll.subscribe(scrollEvent => {
      let delta = scrollEvent.detail.deltaY;

      if (scrollEvent.detail.currentY === 0 && this.hidden) {
        this.show();
      } else if (
        !this.hidden &&
        delta > this.triggerDistance &&
        scrollEvent.detail.currentY - this.maxHeight > 0
      ) {
        this.hide();
      } else if (this.hidden && delta < -this.triggerDistance) {
        this.show();
      }
    });
  }

  initStyles() {
    this.domCtrl.write(() => {
      this.renderer.setStyle(
        this.element.nativeElement,
        'transition',
        '0.2s linear'
      );
      this.renderer.setStyle(
        this.element.nativeElement,
        'height',
        this.headerMaxHeight
      );
    });
  }

  hide() {
    this.domCtrl.write(() => {
      this.renderer.setStyle(this.element.nativeElement, 'min-height', '0px');
      this.renderer.setStyle(this.element.nativeElement, 'height', '0px');
      this.renderer.setStyle(this.element.nativeElement, 'opacity', '0');
      this.renderer.setStyle(this.element.nativeElement, 'padding', '0px');
      this.renderer.setStyle(this.element.nativeElement, 'pointer-events', 'none');
    });

    this.hidden = true;
  }

  show() {
    this.domCtrl.write(() => {
      this.renderer.removeStyle(this.element.nativeElement, 'min-height');
      this.renderer.setStyle(
        this.element.nativeElement,
        'height',
        this.headerMaxHeight
      );
      this.renderer.removeStyle(this.element.nativeElement, 'opacity');
      this.renderer.removeStyle(this.element.nativeElement, 'padding');
      this.renderer.removeStyle(this.element.nativeElement, 'pointer-events');
    });

    this.hidden = false;
  }
}
