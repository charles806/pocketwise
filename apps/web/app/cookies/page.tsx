import type { Metadata } from "next";
import LegalDocument from "../../components/Legal/LegalDocument";

export const metadata: Metadata = {
  title: "Cookie Policy | PocketWise",
};

const Page = () => (
  <LegalDocument>
    <h1 className="font-jakarta text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
      COOKIE POLICY
    </h1>
    <p className="mt-3 text-sm text-slate-500">Last updated August 12, 2026</p>

    <div className="mt-10 text-base md:text-lg text-slate-600 leading-relaxed">
      <p className="mb-4">
        This Cookie Policy explains how{" "}
        <strong className="text-slate-800">USEPOCKETWISE LTD</strong> (
        &quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; and
        &quot;our&quot;) uses cookies and similar technologies to recognize you
        when you visit our website at{" "}
        <a
          href="https://pocketwise.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          https://pocketwise.xyz
        </a>{" "}
        (&quot;Website&quot;). It explains what these technologies are and why
        we use them, as well as your rights to control our use of them.
      </p>
      <p className="mb-4">
        In some cases we may use cookies to collect personal information, or
        that becomes personal information if we combine it with other
        information.
      </p>
    </div>

    <h2 className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4">
      What are cookies?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        Cookies are small data files that are placed on your computer or mobile
        device when you visit a website. Cookies are widely used by website
        owners in order to make their websites work, or to work more
        efficiently, as well as to provide reporting information.
      </p>
      <p className="mb-4">
        Cookies set by the website owner (in this case,{" "}
        <strong className="text-slate-800">USEPOCKETWISE LTD</strong>) are
        called &quot;first-party cookies.&quot; Cookies set by parties other
        than the website owner are called &quot;third-party cookies.&quot;
        Third-party cookies enable third-party features or functionality to be
        provided on or through the website (e.g., advertising, interactive
        content, and analytics). The parties that set these third-party
        cookies can recognize your computer both when it visits the website in
        question and also when it visits certain other websites.
      </p>
    </div>

    <h2 className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4">
      Why do we use cookies?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        We use first- and third-party cookies for several reasons. Some cookies
        are required for technical reasons in order for our Website to operate,
        and we refer to these as &quot;essential&quot; or &quot;strictly
        necessary&quot; cookies. Other cookies also enable us to track and
        target the interests of our users to enhance the experience on our
        Online Properties. Third parties serve cookies through our Website for
        advertising, analytics, and other purposes. This is described in more
        detail below.
      </p>
    </div>

    <h2 className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4">
      How can I control cookies?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        You have the right to decide whether to accept or reject cookies. You
        can exercise your cookie rights by setting your preferences in the
        Cookie Preference Center. The Cookie Preference Center allows you to
        select which categories of cookies you accept or reject. Essential
        cookies cannot be rejected as they are strictly necessary to provide
        you with services.
      </p>
      <p className="mb-4">
        The Cookie Preference Center can be found in the notification banner
        and on our Website. If you choose to reject cookies, you may still use
        our Website though your access to some functionality and areas of our
        Website may be restricted. You may also set or amend your web browser
        controls to accept or refuse cookies.
      </p>
      <p className="mb-4">
        The specific types of first- and third-party cookies served through our
        Website and the purposes they perform are described in the table below
        (please note that the specific cookies served may vary depending on the
        specific Online Properties you visit):
      </p>
      <h3 className="font-jakarta text-xl font-semibold text-slate-900 mt-8 mb-3">
        Unclassified cookies:
      </h3>
      <p className="mb-4">
        These are cookies that have not yet been categorized. We are in the
        process of classifying these cookies with the help of their providers.
      </p>
      <dl className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-1 py-1.5 sm:grid-cols-[150px_1fr]">
          <dt className="text-sm font-semibold text-slate-900">Name:</dt>
          <dd className="text-sm text-slate-600 break-all">
            sentryReplaySession
          </dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-1.5 border-t border-slate-100 sm:grid-cols-[150px_1fr]">
          <dt className="text-sm font-semibold text-slate-900">Provider:</dt>
          <dd className="text-sm text-slate-600 break-all">
            pocketwise.xyz
          </dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-1.5 border-t border-slate-100 sm:grid-cols-[150px_1fr]">
          <dt className="text-sm font-semibold text-slate-900">Type:</dt>
          <dd className="text-sm text-slate-600 break-all">
            html_session_storage
          </dd>
        </div>
        <div className="grid grid-cols-1 gap-1 py-1.5 border-t border-slate-100 sm:grid-cols-[150px_1fr]">
          <dt className="text-sm font-semibold text-slate-900">
            Expires in:
          </dt>
          <dd className="text-sm text-slate-600 break-all">Session</dd>
        </div>
      </dl>
    </div>

    <h2 className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4">
      How can I control cookies on my browser?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        As the means by which you can refuse cookies through your web browser
        controls vary from browser to browser, you should visit your
        browser&apos;s help menu for more information. The following is
        information about how to manage cookies on the most popular browsers:
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>
          <a
            href="https://support.google.com/chrome/answer/95647#zippy=%2Callow-or-block-cookies"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
          >
            Chrome
          </a>
        </li>
        <li>
          <a
            href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
          >
            Internet Explorer
          </a>
        </li>
        <li>
          <a
            href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop?redirectslug=enable-and-disable-cookies-website-preferences&redirectlocale=en-US"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
          >
            Firefox
          </a>
        </li>
        <li>
          <a
            href="https://support.apple.com/en-ie/guide/safari/sfri11471/mac"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
          >
            Safari
          </a>
        </li>
        <li>
          <a
            href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
          >
            Edge
          </a>
        </li>
        <li>
          <a
            href="https://help.opera.com/en/latest/web-preferences/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
          >
            Opera
          </a>
        </li>
      </ul>
      <p className="mb-4">
        In addition, most advertising networks offer you a way to opt out of
        targeted advertising. If you would like to find out more information,
        please visit:
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>
          <a
            href="http://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
          >
            Digital Advertising Alliance
          </a>
        </li>
        <li>
          <a
            href="https://youradchoices.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
          >
            Digital Advertising Alliance of Canada
          </a>
        </li>
        <li>
          <a
            href="http://www.youronlinechoices.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
          >
            European Interactive Digital Advertising Alliance
          </a>
        </li>
      </ul>
    </div>

    <h2 className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4">
      What about other tracking technologies, like web beacons?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        Cookies are not the only way to recognize or track visitors to a
        website. We may use other, similar technologies from time to time, like
        web beacons (sometimes called &quot;tracking pixels&quot; or
        &quot;clear gifs&quot;). These are tiny graphics files that contain a
        unique identifier that enables us to recognize when someone has visited
        our Website or opened an email including them. This allows us, for
        example, to monitor the traffic patterns of users from one page within
        a website to another, to deliver or communicate with cookies, to
        understand whether you have come to the website from an online
        advertisement displayed on a third-party website, to improve site
        performance, and to measure the success of email marketing campaigns.
        In many instances, these technologies are reliant on cookies to
        function properly, and so declining cookies will impair their
        functioning.
      </p>
    </div>

    <h2 className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4">
      Do you use Flash cookies or Local Shared Objects?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        Websites may also use so-called &quot;Flash Cookies&quot; (also known
        as Local Shared Objects or &quot;LSOs&quot;) to, among other things,
        collect and store information about your use of our services, fraud
        prevention, and for other site operations.
      </p>
      <p className="mb-4">
        If you do not want Flash Cookies stored on your computer, you can
        adjust the settings of your Flash player to block Flash Cookies storage
        using the tools contained in the{" "}
        <a
          href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          Website Storage Settings Panel
        </a>
        . You can also control Flash Cookies by going to the{" "}
        <a
          href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager03.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          Global Storage Settings Panel
        </a>{" "}
        and following the instructions (which may include instructions that
        explain, for example, how to delete existing Flash Cookies (referred to
        &quot;information&quot; on the Macromedia site), how to prevent Flash
        LSOs from being placed on your computer without your being asked, and
        (for Flash Player 8 and later) how to block Flash Cookies that are not
        being delivered by the operator of the page you are on at the time).
      </p>
      <p className="mb-4">
        Please note that setting the Flash Player to restrict or limit
        acceptance of Flash Cookies may reduce or impede the functionality of
        some Flash applications, including, potentially, Flash applications
        used in connection with our services or online content.
      </p>
    </div>

    <h2 className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4">
      Do you serve targeted advertising?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        Third parties may serve cookies on your computer or mobile device to
        serve advertising through our Website. These companies may use
        information about your visits to this and other websites in order to
        provide relevant advertisements about goods and services that you may
        be interested in. They may also employ technology that is used to
        measure the effectiveness of advertisements. They can accomplish this
        by using cookies or web beacons to collect information about your
        visits to this and other sites in order to provide relevant
        advertisements about goods and services of potential interest to you.
        The information collected through this process does not enable us or
        them to identify your name, contact details, or other details that
        directly identify you unless you choose to provide these.
      </p>
    </div>

    <h2 className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4">
      How often will you update this Cookie Policy?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        We may update this Cookie Policy from time to time in order to reflect,
        for example, changes to the cookies we use or for other operational,
        legal, or regulatory reasons. Please therefore revisit this Cookie
        Policy regularly to stay informed about our use of cookies and related
        technologies.
      </p>
      <p className="mb-4">
        The date at the top of this Cookie Policy indicates when it was last
        updated.
      </p>
    </div>

    <h2 className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4">
      Where can I get further information?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        If you have any questions about our use of cookies or other
        technologies, please contact us at:
      </p>
      <p className="mb-4 whitespace-pre-line">
        <strong className="text-slate-800">USEPOCKETWISE LTD</strong>
        {"\n"}
        No 2 Love Road Alabidn Ibadan Oyo State
        {"\n"}
        Ibadan,
        {"\n"}
        OYO STATE
        {"\n"}
        Nigeria
        {"\n"}
        Phone: <a
          href="tel:07032355643"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          07032355643
        </a>
      </p>
    </div>
  </LegalDocument>
);

export default Page;