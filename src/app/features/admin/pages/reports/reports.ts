import { Component } from '@angular/core';
@Component({selector:'app-admin-reports',standalone:true,templateUrl:'./reports.html',styleUrl:'./reports.scss'})
export class AdminReports { readonly stats=[{label:'Gross sales',value:'$48,294.80',change:'+12.8%'},{label:'Orders processed',value:'1,284',change:'+8.2%'},{label:'Average order value',value:'$37.61',change:'+3.1%'},{label:'Refund rate',value:'1.8%',change:'Within target'}]; readonly months=[{month:'May',width:45},{month:'Jun',width:58},{month:'Jul',width:52},{month:'Aug',width:70},{month:'Sep',width:64},{month:'Oct',width:88}]; }
