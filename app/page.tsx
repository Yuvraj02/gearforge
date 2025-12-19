import Link from "next/link";
import HomePage from "./home/page";

export default function Home() {
  return (<>
    <HomePage/>
    <footer className="m-2">
      <div className="border-t border-gray-700 pt-2 pb-1 flex justify-center gap-3">
        <span><Link href={'/footer/policies/PrivacyPolicy'} className="hover:cursor-pointer hover:underline text-xs md:text-[16px]">Privacy Policy</Link></span>
        <p> | </p>
        <span><Link href={'/footer/policies/TermsAndConditions'}  className="hover:cursor-pointer hover:underline text-xs md:text-[16px]">Terms & Conditions</Link></span>
        <p> | </p>
        <span><Link href={'/footer/policies/RefundAndCancellationPolicy'}  className="hover:cursor-pointer hover:underline text-xs md:text-[16px]">Refund & Cancellation Policy</Link></span>
      </div>
    </footer>
    </>
  );
}
