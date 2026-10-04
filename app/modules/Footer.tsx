import Copyright from "./Copyright";
import SocialIconBox from './SocialIconBox';
import { socialIcons } from '@/src/constants/socialIcons';

export default function Footer() {

    return (
        <footer className="site-footer p-10 text-center">
            <SocialIconBox icons={socialIcons} />
            <div>
                <Copyright />
            </div>
        </footer>
    );
}
