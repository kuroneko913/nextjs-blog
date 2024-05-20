import { Archives } from "@/src/interfaces/post";

export default function ArchiveList(props: { archives: Archives }) {
    const { archives } = props;
    return (
        <>
            { Object.keys(archives).sort().map((archiveYear) => (
                <details key={archiveYear}><summary>{archiveYear} ({
                    Object.keys(archives[archiveYear]).reduce((acc, archiveDate) => acc + archives[archiveYear][archiveDate], 0)
                })</summary>
                    <ul className="py-1">
                        { Object.keys(archives[archiveYear]).sort().map((archiveDate) => (
                            <li key={archiveDate}>
                                <a href={`/blog?archive=${archiveDate}`}><span className="px-4">{archiveDate} ({archives[archiveYear][archiveDate]})</span></a>
                            </li>
                        ))}
                    </ul>
                </details>
            ))}
        </>
    );
}
