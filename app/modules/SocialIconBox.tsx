import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function SocialIconBox(props: { icons: { icon: any, link: string, width: string, height: string }[] }) {
    const icons = props.icons;

    return (
        <div className="social-icons flex space-x-8 justify-center sm:justify-start sm:p-10" style={{ height: "50px" }}>
            {icons.map((icon, index) => (
                <a key={index} href={icon.link} target="_blank" rel="noopener noreferrer" style={{ width: icon.width, height: icon.height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={icon.icon} size="2x" />
                </a>
            ))}
        </div>
    );
}
