import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function HeartNum(props: { heartNum: number }) {
    const heartNum = props.heartNum;
    return (
        <div className="w-full flex justify-end items-center p-4">
            <FontAwesomeIcon icon={faHeart} className="mr-2 text-red-500" />
            <span>{heartNum}</span>
        </div>
    )
}
