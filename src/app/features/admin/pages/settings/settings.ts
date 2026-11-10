import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({selector:'app-admin-settings',standalone:true,imports:[FormsModule],templateUrl:'./settings.html',styleUrl:'./settings.scss'})
export class AdminSettings { storeName='Dista Marketplace'; supportEmail='support@example.com'; currency='USD'; timezone='Asia/Kolkata'; saved=false; save():void{this.saved=true;} }
