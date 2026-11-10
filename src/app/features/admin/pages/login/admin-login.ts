import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
@Component({selector:'app-admin-login',standalone:true,imports:[FormsModule,RouterLink],templateUrl:'./admin-login.html',styleUrl:'./admin-login.scss'})
export class AdminLogin { email='admin@dista.demo'; password='AdminDemo123!'; error=''; busy=false; constructor(private auth:AuthService,private router:Router,private route:ActivatedRoute){} async signIn():Promise<void>{this.error='';this.busy=true;const result=await this.auth.login(this.email,this.password);this.busy=false;if(!result.success){this.error=result.message||'Unable to sign in.';return;}if(result.user?.role!=='admin'){this.auth.logout();this.error='This account does not have administrator access.';return;}const target=this.route.snapshot.queryParamMap.get('returnUrl')||'/admin/dashboard';await this.router.navigateByUrl(target);}}
