import "./styles/styles.scss";
import "./styles/layout.scss";
import {Router} from "./router";

class App {
    constructor() {
        new Router();
    }
}

(new App());