import { remark } from "remark";
import html from "remark-html";

export default async function markdownToHtml(markdown: string) {
    return remark().use(html).process(markdown)
        .then((result) => { return result.toString()});
}
