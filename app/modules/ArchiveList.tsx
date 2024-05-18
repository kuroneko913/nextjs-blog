export default function ArchiveList(props) {
    const { archives } = props;
    return (
        <>
            { Object.keys(archives).sort().map((archive) => (
                <details><summary>{archive} ({
                    Object.keys(archives[archive]).reduce((acc, archiveDate) => acc + archives[archive][archiveDate], 0)
                })</summary>
                    <ul className="py-1">
                        { Object.keys(archives[archive]).sort().map((archiveDate, index) => (
                            <li key={index}>
                                <a href={`/blog?archive=${archiveDate}`}><span className="px-4">{archiveDate} ({archives[archive][archiveDate]})</span></a>
                            </li>
                        ))}
                    </ul>
                </details>
            ))}
        </>
    );
}
