import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  ngAfterViewInit() {
  const counters = document.querySelectorAll('.stat-number');

  counters.forEach((counter: any) => {
    const updateCount = () => {
      const target = +counter.getAttribute('data-target');
      const current = +counter.innerText;
      const increment = target / 150; 

      if (current < target) {
        counter.innerText = Math.ceil(current + increment);
        setTimeout(updateCount, 20);
      } else {
        counter.innerText = target;
      }
    };

    updateCount();
  });
}
}
