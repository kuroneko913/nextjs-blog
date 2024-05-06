import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faXTwitter } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
export default function Footer() {
    return (
        <footer className="bg-white text-black p-16 text-center">
            <div className="social-icons flex justify-start gap-4" style={{ height: "50px" }}>
                <a href="https://twitter.com/myblackcat7112" target="_blank" rel="noopener noreferrer" style={{ width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faXTwitter} size="2x" />
                </a>
                <a href="https://github.com/kuroneko913" target="_blank" rel="noopener noreferrer" style={{ width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faGithub} size="2x" />
                </a>
                <a href="mailto:myblackcat7112@gmail.com" style={{ width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faEnvelope} size="2x" />
                </a>
            </div>
            <div>
                <p>©2024 くろねこ。の実験室</p>
            </div>
        </footer>
    );
}
