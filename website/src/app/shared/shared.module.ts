import { NgModule } from '@angular/core';
import { ScrollVanishDirective } from '../directives/scroll-vanish.directive';

@NgModule({
    declarations: [ScrollVanishDirective],
    exports: [ScrollVanishDirective]
})
export class SharedModule { }
