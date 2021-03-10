import {Size} from "../hui/helpers/Rectangle";
import {Book} from "./Book";
import {uuid} from "../hui/helpers/Uuid";
import {IconService} from "./IconService";
import {Icon} from "./Icon";

export class BookService{

    static newBook(iconSize: Size): Book{
        return {
            id: uuid(),
            icons: [IconService.newIcon(iconSize.width, iconSize.height)]
        }
    }

    static fromIcons(icons: Icon[]): Book{
        return {
            id: uuid(),
            icons
        }
    }

}