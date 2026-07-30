
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar-item',
  templateUrl: './sidebar-item.component.html',
  standalone: true
})
export class SidebarItemComponent {
  @Input() label = '';
  @Input() itemClass = 'flex items-center gap-3 w-full';
}
