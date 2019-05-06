import { Component, OnInit } from "@angular/core";
import { environment } from '~/environments/environment';
import { AuthService } from '~/app/services/auth/auth.service';

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

    constructor(private authService: AuthService) {
        console.log(environment.api);
        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        // Init your component properties here.
    }
}
