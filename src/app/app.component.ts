import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import * as Papa from 'papaparse';
import { CommonModule } from '@angular/common'; 
import{MatButtonModule} from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Chart, registerables } from 'chart.js'; 

Chart.register(...registerables);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,  CommonModule,          
  MatButtonModule,       
  MatIconModule,        
  MatFormFieldModule,    
  MatInputModule  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'batteryTestBench';
  chart: any;
  fileContent: string = '';

  constructor() {
    Chart.register(...registerables); 
  }

  
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fileContent = reader.result as string;
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid .txt file');
    }
  }

  
  parseFileContent(content: string): { x: number; y: number }[] {
    const lines = content.split('\n');
    const data: { x: number; y: number }[] = [];
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length === 2) {
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        if (!isNaN(x) && !isNaN(y)) {
          data.push({ x, y });
        }
      }
    });
    
    return data;
  }

  
  generateGraph(): void {
    const data = this.parseFileContent(this.fileContent);
    if (data.length === 0) {  
      alert('No valid data found in the file.');
      return;
    }

    
    if (this.chart) {
      this.chart.destroy();
    }

    
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'X vs Y Plot',
          data: data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          pointRadius: 5,
          pointBackgroundColor: 'rgb(75, 192, 192)',
          fill: false,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: 'X'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Y'
            }
          }
        }
      }
    });
  }
  
}
