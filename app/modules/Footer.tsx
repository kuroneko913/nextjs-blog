import SocialIconBox from './SocialIconBox';
import { socialIcons } from '@/src/constants/socialIcons';

export default function Footer() {

    return (
        <footer className="bg-white text-black p-10 text-center">
            <SocialIconBox icons={socialIcons} />
            <div>
                <p>©2024 くろねこ。の実験室</p>
            </div>
        </footer>
    );
}
