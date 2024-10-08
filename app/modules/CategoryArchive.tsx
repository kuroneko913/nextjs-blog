import { Archives, Categories } from "@/src/interfaces/post";
import ArchiveList from "./ArchiveList";

export default function CategoryArchive(props: { categories: Categories, archives: Archives }) {
    const { categories, archives } = props;

    return (
        <div className="w-full sm:w-1/4 flex flex-col" style={{ height: "100%", marginTop: "100px" }}>
            <div>
                <h1 className="text-2xl pb-4 font-bold">Category</h1>
                <ul>
                    { Object.keys(categories).map((category, index) => (
                        <li key={index}>
                            <a href={`/blog?category=${category}`}>{category}({categories[category]})</a>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="py-10">
                <h1 className="text-2xl pb-4 font-bold">Archive</h1>
                <ArchiveList archives={archives} />
            </div>
        </div>
    );
}
