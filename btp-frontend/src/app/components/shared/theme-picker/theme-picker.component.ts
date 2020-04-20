import { HomeComponent } from "./../../home/home.component";
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { StyleManagerService } from "../style-manager/style-manager.service";

@Component({
  selector: "app-theme-picker",
  templateUrl: "./theme-picker.component.html",
  styleUrls: ["./theme-picker.component.scss"],
  providers: [HomeComponent],
  encapsulation: ViewEncapsulation.None,
})
export class ThemePickerComponent implements OnInit {
  currentTheme: any;
  themes: CustomTheme[] = [
    {
      primary: "#d32f2f",
      accent: "#42a5f5",
      name: "deeppurple-amber",
      isDark: false,
    },
    {
      primary: "#3F51B5",
      accent: "#E91E63",
      name: "indigo-pink",
      isDark: false,
      // isDefault: true,
    },
    {
      primary: "#E91E63",
      accent: "#607D8B",
      name: "pink-grey",
      isDark: true,
    },
    {
      primary: "#9C27B0",
      accent: "#4CAF50",
      name: "purple-green",
      isDark: true,
    },
    {
      primary: "#F6C109",
      accent: "#F16C06",
      name: "iitpkd-light",
      isDark: false,
    },
  ];
  constructor(
    public styleManager: StyleManagerService,
    private home: HomeComponent
  ) {}

  ngOnInit() {
    this.installTheme(localStorage.getItem("current-theme"));
  }

  installTheme(themeName: string) {
    const theme = this.themes.find(
      (currentTheme) => currentTheme.name === themeName
    );
    if (!theme) {
      return;
    }

    if (theme.isDefault) {
      // this.currentTheme = theme; //dont uncomment this for now
      // localStorage.setItem("current-theme", theme.name);
      this.styleManager.removeStyle("theme");
      localStorage.setItem("current-theme", theme.name);
      this.currentTheme = theme;
    } else {
      localStorage.setItem("current-theme", theme.name);
      this.currentTheme = theme;
      this.styleManager.setStyle("theme", `/assets/${theme.name}.css`);
    }
  }
}

export interface CustomTheme {
  name: string;
  accent: string;
  primary: string;
  isDark?: boolean;
  isDefault?: boolean;
}
