import Image from "next/image";

export default function HeaderGif() {
    return (
        <Image
        src="/assets/ui/recoil header files/recoil_headeranim.gif"
        alt="recoil"
        className="w-full h-12 object-cover rounded-md"
        width={154}
        height={69}
        />
    );
}
