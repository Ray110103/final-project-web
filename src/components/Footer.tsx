import Image from "next/image";
const Footer = () => {
  return (
    <footer className="border-t text-white mt-10">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-8 text-sm">
        <p className="text-center text-xl md:text-2xl mb-5 font-bold  text-white motion-preset-slide-left motion-duration-2000">
          OTO <span className="font-bold bg-[linear-gradient(to_left,_#df8908_10%,_#ff1d15_100%)] bg-clip-text text-transparent">EVENT</span>
        </p>
        <p className="text-center sm:text-left">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
