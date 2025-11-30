import { Component, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {

  ngAfterViewInit() {
    const counters = document.querySelectorAll('.stat-number');
    const statsSection: any = document.querySelector('.stats-section');

    // Stop re-running animation
    let animated = false;

    // Function to animate numbers
    const animateCounters = () => {
      counters.forEach((counter: any) => {
        const update = () => {
          const target = +counter.getAttribute('data-target');
          const current = +counter.innerText;
          const increment = target / 150;

          if (current < target) {
            counter.innerText = Math.ceil(current + increment);
            setTimeout(update, 15);
          } else {
            counter.innerText = target;
          }
        };
        update();
      });
    };

    // Intersection Observer (when section becomes visible)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated) {
          animateCounters();
          animated = true;
        }
      },
      { threshold: 0.4 } // يبدأ لما حوالي 40% من السكشن يظهر
    );

    observer.observe(statsSection);
  }
}
