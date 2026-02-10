import { Component } from '@angular/core';
import { Nav } from '../../shared/components/nav/nav';
import { Header } from '../../shared/components/header/header';

@Component({
  selector: 'app-add-task',
  imports: [Nav, Header],
  templateUrl: './add-task.html',
  styleUrl: './add-task.scss',
})
export class AddTask {

}
