import type { Metadata } from "next";
import LegalDocument from "../../components/Legal/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy Policy | PocketWise",
};

const Page = () => (
  <LegalDocument>
    <h1 className="font-jakarta text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
      PRIVACY POLICY
    </h1>
    <p className="mt-3 text-sm text-slate-500">Last updated August 12, 2026</p>

    <div className="mt-10 text-base md:text-lg text-slate-600 leading-relaxed">
      <p className="mb-4">
        This Privacy Notice for{" "}
        <strong className="text-slate-800">USEPOCKETWISE LTD</strong> (
        &apos;we&apos;, &apos;us&apos;, or &apos;our&apos;), describes how and
        why we might access, collect, store, use, and/or share (
        &apos;process&apos;) your personal information when you use our services
        (&apos;Services&apos;), including when you:
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>
          Visit our website at{" "}
          <a
            href="https://pocketwise.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
          >
            https://pocketwise.xyz
          </a>{" "}
          or any website of ours that links to this Privacy Notice
        </li>
        <li>
          Download and use our mobile application (Pocketwise), or any other
          application of ours that links to this Privacy Notice
        </li>
        <li>
          Use Pocketwise. PocketWise is a personal finance app for Nigerian
          youth aged 16-25. It automatically splits every deposit into four
          purpose-driven wallets: Spend (50%), Savings (30%), Emergency (10%),
          and Flex (10%). Users can set savings goals, make peer-to-peer
          transfers to other PocketWise users, send money to Nigerian bank
          accounts, and manage their emergency fund. The app collects personal
          information including name, email address, phone number, date of
          birth, and government-issued ID (NIN) for identity verification.
          Financial transactions are processed through a licensed
          Banking-as-a-Service partner. The app is available on web and mobile.
          The company is registered in Nigeria as USEPOCKETWISE LTD.
        </li>
        <li>
          Engage with us in other related ways, including any marketing or
          events
        </li>
      </ul>
      <p className="mb-4">
        <strong className="text-slate-800">Questions or concerns?</strong>{" "}
        Reading this Privacy Notice will help you understand your privacy
        rights and choices. We are responsible for making decisions about how
        your personal information is processed. If you do not agree with our
        policies and practices, please do not use our Services. If you still
        have any questions or concerns, please contact us at{" "}
        <a
          href="mailto:support@pocketwise.xyz"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          support@pocketwise.xyz
        </a>
        .
      </p>
    </div>

    <h2 className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4">
      SUMMARY OF KEY POINTS
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        <em>
          This summary provides key points from our Privacy Notice, but you can
          find out more details about any of these topics by clicking the link
          following each key point or by using our{" "}
          <a
            href="#toc"
            className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
          >
            table of contents
          </a>{" "}
          below to find the section you are looking for.
        </em>
      </p>
      <p className="mb-4">
        <strong className="text-slate-800">
          What personal information do we process?
        </strong>{" "}
        When you visit, use, or navigate our Services, we may process personal
        information depending on how you interact with us and the Services, the
        choices you make, and the products and features you use. Learn more
        about{" "}
        <a
          href="#personalinfo"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          personal information you disclose to us
        </a>
        .
      </p>
      <p className="mb-4">
        <strong className="text-slate-800">
          Do we process any sensitive personal information?
        </strong>{" "}
        Some of the information may be considered &apos;special&apos; or
        &apos;sensitive&apos; in certain jurisdictions, for example your racial
        or ethnic origins, sexual orientation, and religious beliefs. We may
        process sensitive personal information when necessary with your consent
        or as otherwise permitted by applicable law. Learn more about{" "}
        <a
          href="#sensitiveinfo"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          sensitive information we process
        </a>
        .
      </p>
      <p className="mb-4">
        <strong className="text-slate-800">
          Do we collect any information from third parties?
        </strong>{" "}
        We may collect information from public databases, marketing partners,
        social media platforms, and other outside sources. Learn more about{" "}
        <a
          href="#othersources"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          information collected from other sources
        </a>
        .
      </p>
      <p className="mb-4">
        <strong className="text-slate-800">
          How do we process your information?
        </strong>{" "}
        We process your information to provide, improve, and administer our
        Services, communicate with you, for security and fraud prevention, and
        to comply with law. We may also process your information for other
        purposes with your consent. We process your information only when we
        have a valid legal reason to do so. Learn more about{" "}
        <a
          href="#infouse"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          how we process your information
        </a>
        .
      </p>
      <p className="mb-4">
        <strong className="text-slate-800">
          In what situations and with which types of parties do we share
          personal information?
        </strong>{" "}
        We may share information in specific situations and with specific
        categories of third parties. Learn more about{" "}
        <a
          href="#whoshare"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          when and with whom we share your personal information
        </a>
        .
      </p>
      <p className="mb-4">
        <strong className="text-slate-800">
          How do we keep your information safe?
        </strong>{" "}
        We have adequate organisational and technical processes and procedures
        in place to protect your personal information. However, no electronic
        transmission over the internet or information storage technology can be
        guaranteed to be 100% secure, so we cannot promise or guarantee that
        hackers, cybercriminals, or other unauthorised third parties will not
        be able to defeat our security and improperly collect, access, steal,
        or modify your information. Learn more about{" "}
        <a
          href="#infosafe"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          how we keep your information safe
        </a>
        .
      </p>
      <p className="mb-4">
        <strong className="text-slate-800">What are your rights?</strong>{" "}
        Depending on where you are located geographically, the applicable
        privacy law may mean you have certain rights regarding your personal
        information. Learn more about{" "}
        <a
          href="#privacyrights"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          your privacy rights
        </a>
        .
      </p>
      <p className="mb-4">
        <strong className="text-slate-800">
          How do you exercise your rights?
        </strong>{" "}
        The easiest way to exercise your rights is by submitting a{" "}
        <a
          href="https://app.termly.io/dsar/87386610-3219-4d88-a5d5-82cd21aa8c8b"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          data subject access request
        </a>
        , or by contacting us. We will consider and act upon any request in
        accordance with applicable data protection laws.
      </p>
      <p className="mb-4">
        Want to learn more about what we do with any information we collect?{" "}
        <a
          href="#toc"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          Review the Privacy Notice in full
        </a>
        .
      </p>
    </div>

    <h2
      id="toc"
      className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4"
    >
      TABLE OF CONTENTS
    </h2>
    <ol className="list-decimal pl-6 space-y-2 text-base text-[#4f46e5]">
      <li>
        <a
          href="#infocollect"
          className="hover:text-[#4338ca] underline underline-offset-2"
        >
          WHAT INFORMATION DO WE COLLECT?
        </a>
      </li>
      <li>
        <a
          href="#infouse"
          className="hover:text-[#4338ca] underline underline-offset-2"
        >
          HOW DO WE PROCESS YOUR INFORMATION?
        </a>
      </li>
      <li>
        <a
          href="#whoshare"
          className="hover:text-[#4338ca] underline underline-offset-2"
        >
          WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
        </a>
      </li>
      <li>
        <a
          href="#cookies"
          className="hover:text-[#4338ca] underline underline-offset-2"
        >
          DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?
        </a>
      </li>
      <li>
        <a
          href="#inforetain"
          className="hover:text-[#4338ca] underline underline-offset-2"
        >
          HOW LONG DO WE KEEP YOUR INFORMATION?
        </a>
      </li>
      <li>
        <a
          href="#infosafe"
          className="hover:text-[#4338ca] underline underline-offset-2"
        >
          HOW DO WE KEEP YOUR INFORMATION SAFE?
        </a>
      </li>
      <li>
        <a
          href="#privacyrights"
          className="hover:text-[#4338ca] underline underline-offset-2"
        >
          WHAT ARE YOUR PRIVACY RIGHTS?
        </a>
      </li>
      <li>
        <a
          href="#DNT"
          className="hover:text-[#4338ca] underline underline-offset-2"
        >
          CONTROLS FOR DO-NOT-TRACK FEATURES
        </a>
      </li>
      <li>
        <a
          href="#policyupdates"
          className="hover:text-[#4338ca] underline underline-offset-2"
        >
          DO WE MAKE UPDATES TO THIS NOTICE?
        </a>
      </li>
      <li>
        <a
          href="#contact"
          className="hover:text-[#4338ca] underline underline-offset-2"
        >
          HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
        </a>
      </li>
      <li>
        <a
          href="#request"
          className="hover:text-[#4338ca] underline underline-offset-2"
        >
          HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
        </a>
      </li>
    </ol>

    <h2
      id="infocollect"
      className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4"
    >
      1. WHAT INFORMATION DO WE COLLECT?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <h3
        id="personalinfo"
        className="font-jakarta text-xl font-semibold text-slate-900 mt-8 mb-3"
      >
        Personal information you disclose to us
      </h3>
      <p className="mb-4">
        <em>
          <strong className="text-slate-800">In Short:</strong> We collect
          personal information that you provide to us.
        </em>
      </p>
      <p className="mb-4">
        We collect personal information that you voluntarily provide to us when
        you register on the Services, express an interest in obtaining
        information about us or our products and Services, when you participate
        in activities on the Services, or otherwise when you contact us.
      </p>
      <p className="mb-4">
        <strong className="text-slate-800">
          Personal Information Provided by You.
        </strong>{" "}
        The personal information that we collect depends on the context of your
        interactions with us and the Services, the choices you make, and the
        products and features you use. The personal information we collect may
        include the following:
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>names</li>
        <li>phone numbers</li>
        <li>email addresses</li>
        <li>mailing addresses</li>
        <li>usernames</li>
        <li>passwords</li>
        <li>contact or authentication data</li>
        <li>bank details</li>
      </ul>
      <p className="mb-4">
        <strong className="text-slate-800">Sensitive Information.</strong> When
        necessary, with your consent or as otherwise permitted by applicable
        law, we process the following categories of sensitive information:
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>financial data</li>
        <li>biometric data</li>
      </ul>
      <p className="mb-4">
        <strong className="text-slate-800">Payment Data.</strong> We may
        collect data necessary to process your payment if you choose to make
        purchases, such as your payment instrument number, and the security
        code associated with your payment instrument. All payment data is
        handled and stored by Anchor. You may find their privacy notice link(s)
        here:{" "}
        <a
          href="https://getanchor.co/privacy-policy.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          https://getanchor.co/privacy-policy.html
        </a>
        .
      </p>
      <p className="mb-4">
        <strong className="text-slate-800">Application Data.</strong> If you
        use our application(s), we also may collect the following information
        if you choose to provide us with access or permission:
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>
          <em>Mobile Device Access.</em> We may request access or permission to
          certain features from your mobile device, including your mobile
          device&apos;s camera, sms messages, and other features. If you wish
          to change our access or permissions, you may do so in your
          device&apos;s settings.
        </li>
        <li>
          <em>Push Notifications.</em> We may request to send you push
          notifications regarding your account or certain features of the
          application(s). If you wish to opt out from receiving these types of
          communications, you may turn them off in your device&apos;s settings.
        </li>
      </ul>
      <p className="mb-4">
        This information is primarily needed to maintain the security and
        operation of our application(s), for troubleshooting, and for our
        internal analytics and reporting purposes.
      </p>
      <p className="mb-4">
        All personal information that you provide to us must be true, complete,
        and accurate, and you must notify us of any changes to such personal
        information.
      </p>

      <h3 className="font-jakarta text-xl font-semibold text-slate-900 mt-8 mb-3">
        Information automatically collected
      </h3>
      <p className="mb-4">
        <em>
          <strong className="text-slate-800">In Short:</strong> Some information
          — such as your Internet Protocol (IP) address and/or browser and
          device characteristics — is collected automatically when you visit
          our Services.
        </em>
      </p>
      <p className="mb-4">
        We automatically collect certain information when you visit, use, or
        navigate the Services. This information does not reveal your specific
        identity (like your name or contact information) but may include device
        and usage information, such as your IP address, browser and device
        characteristics, operating system, language preferences, referring
        URLs, device name, country, location, information about how and when
        you use our Services, and other technical information. This information
        is primarily needed to maintain the security and operation of our
        Services, and for our internal analytics and reporting purposes.
      </p>
      <p className="mb-4">
        Like many businesses, we also collect information through cookies and
        similar technologies.
      </p>
      <p className="mb-4">The information we collect includes:</p>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>
          <em>Log and Usage Data.</em> Log and usage data is service-related,
          diagnostic, usage, and performance information our servers
          automatically collect when you access or use our Services and which
          we record in log files. Depending on how you interact with us, this
          log data may include your IP address, device information, browser
          type, and settings and information about your activity in the
          Services (such as the date/time stamps associated with your usage,
          pages and files viewed, searches, and other actions you take such as
          which features you use), device event information (such as system
          activity, error reports (sometimes called &apos;crash dumps&apos;),
          and hardware settings).
        </li>
      </ul>

      <h3
        id="othersources"
        className="font-jakarta text-xl font-semibold text-slate-900 mt-8 mb-3"
      >
        Information collected from other sources
      </h3>
      <p className="mb-4">
        <em>
          <strong className="text-slate-800">In Short:</strong> We may collect
          limited data from public databases, marketing partners, and other
          outside sources.
        </em>
      </p>
      <p className="mb-4">
        In order to enhance our ability to provide relevant marketing, offers,
        and services to you and update our records, we may obtain information
        about you from other sources, such as public databases, joint marketing
        partners, affiliate programs, data providers, and from other third
        parties. This information includes mailing addresses, job titles,
        email addresses, phone numbers, intent data (or user behaviour data),
        Internet Protocol (IP) addresses, social media profiles, social media
        URLs, and custom profiles, for purposes of targeted advertising and
        event promotion.
      </p>
    </div>

    <h2
      id="infouse"
      className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4"
    >
      2. HOW DO WE PROCESS YOUR INFORMATION?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        <em>
          <strong className="text-slate-800">In Short:</strong> We process your
          information to provide, improve, and administer our Services,
          communicate with you, for security and fraud prevention, and to
          comply with law. We may also process your information for other
          purposes with your consent.
        </em>
      </p>
      <p className="mb-4">
        <strong className="text-slate-800">
          We process your personal information for a variety of reasons,
          depending on how you interact with our Services, including:
        </strong>
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>
          <strong className="text-slate-800">
            To facilitate account creation and authentication and otherwise
            manage user accounts.
          </strong>{" "}
          We may process your information so you can create and log in to your
          account, as well as keep your account in working order.
        </li>
        <li>
          <strong className="text-slate-800">
            To deliver and facilitate delivery of services to the user.
          </strong>{" "}
          We may process your information to provide you with the requested
          service.
        </li>
        <li>
          <strong className="text-slate-800">
            To comply with our legal obligations.
          </strong>{" "}
          We may process your information to comply with our legal obligations,
          respond to legal requests, and exercise, establish, or defend our
          legal rights.
        </li>
      </ul>
    </div>

    <h2
      id="whoshare"
      className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4"
    >
      3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        <em>
          <strong className="text-slate-800">In Short:</strong> We may share
          information in specific situations described in this section and/or
          with the following categories of third parties.
        </em>
      </p>
      <p className="mb-4">
        <strong className="text-slate-800">
          Vendors, Consultants, and Other Third-Party Service Providers.
        </strong>{" "}
        We may share your data with third-party vendors, service providers,
        contractors, or agents (&apos;third parties&apos;) who perform services
        for us or on our behalf and require access to such information to do
        that work.
      </p>
      <p className="mb-4">
        The categories of third parties we may share personal information with
        are as follows:
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>Finance &amp; Accounting Tools</li>
        <li>Payment Processors</li>
      </ul>
      <p className="mb-4">
        We also may need to share your personal information in the following
        situations:
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>
          <strong className="text-slate-800">Business Transfers.</strong> We
          may share or transfer your information in connection with, or during
          negotiations of, any merger, sale of company assets, financing, or
          acquisition of all or a portion of our business to another company.
        </li>
        <li>
          <strong className="text-slate-800">Affiliates.</strong> We may share
          your information with our affiliates, in which case we will require
          those affiliates to honour this Privacy Notice. Affiliates include
          our parent company and any subsidiaries, joint venture partners, or
          other companies that we control or that are under common control with
          us.
        </li>
      </ul>
    </div>

    <h2
      id="cookies"
      className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4"
    >
      4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        <em>
          <strong className="text-slate-800">In Short:</strong> We may use
          cookies and other tracking technologies to collect and store your
          information.
        </em>
      </p>
      <p className="mb-4">
        We may use cookies and similar tracking technologies (like web beacons
        and pixels) to gather information when you interact with our Services.
        Some online tracking technologies help us maintain the security of our
        Services and your account, prevent crashes, fix bugs, save your
        preferences, and assist with basic site functions.
      </p>
      <p className="mb-4">
        We also permit third parties and service providers to use online
        tracking technologies on our Services for analytics and advertising,
        including to help manage and display advertisements or to tailor
        advertisements to your interests. The third parties and service
        providers use their technology to provide advertising about products
        and services tailored to your interests which may appear either on our
        Services or on other websites.
      </p>
      <p className="mb-4">
        Specific information about how we use such technologies and how you can
        refuse certain cookies is set out in our Cookie Notice.
      </p>
      <h3 className="font-jakarta text-xl font-semibold text-slate-900 mt-8 mb-3">
        Google Analytics
      </h3>
      <p className="mb-4">
        We may share your information with Google Analytics to track and
        analyse the use of the Services. The Google Analytics Advertising
        Features that we may use include: Remarketing with Google Analytics. To
        opt out of being tracked by Google Analytics across the Services, visit{" "}
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          https://tools.google.com/dlpage/gaoptout
        </a>
        . You can opt out of Google Analytics Advertising Features through{" "}
        <a
          href="https://adssettings.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          Ads Settings
        </a>{" "}
        and Ad Settings for mobile apps. Other opt out means include{" "}
        <a
          href="http://optout.networkadvertising.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          http://optout.networkadvertising.org/
        </a>{" "}
        and{" "}
        <a
          href="http://www.networkadvertising.org/mobile-choice"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          http://www.networkadvertising.org/mobile-choice
        </a>
        . For more information on the privacy practices of Google, please visit
        the{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          Google Privacy &amp; Terms page
        </a>
        .
      </p>
    </div>

    <h2
      id="inforetain"
      className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4"
    >
      5. HOW LONG DO WE KEEP YOUR INFORMATION?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        <em>
          <strong className="text-slate-800">In Short:</strong> We keep your
          information for as long as necessary to fulfil the purposes outlined
          in this Privacy Notice unless otherwise required by law.
        </em>
      </p>
      <p className="mb-4">
        We will only keep your personal information for as long as it is
        necessary for the purposes set out in this Privacy Notice, unless a
        longer retention period is required or permitted by law (such as tax,
        accounting, or other legal requirements). No purpose in this notice
        will require us keeping your personal information for longer than the
        period of time in which users have an account with us.
      </p>
      <p className="mb-4">
        When we have no ongoing legitimate business need to process your
        personal information, we will either delete or anonymise such
        information, or, if this is not possible (for example, because your
        personal information has been stored in backup archives), then we will
        securely store your personal information and isolate it from any
        further processing until deletion is possible.
      </p>
    </div>

    <h2
      id="infosafe"
      className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4"
    >
      6. HOW DO WE KEEP YOUR INFORMATION SAFE?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        <em>
          <strong className="text-slate-800">In Short:</strong> We aim to
          protect your personal information through a system of organisational
          and technical security measures.
        </em>
      </p>
      <p className="mb-4">
        We have implemented appropriate and reasonable technical and
        organisational security measures designed to protect the security of
        any personal information we process. However, despite our safeguards
        and efforts to secure your information, no electronic transmission over
        the Internet or information storage technology can be guaranteed to be
        100% secure, so we cannot promise or guarantee that hackers,
        cybercriminals, or other unauthorised third parties will not be able to
        defeat our security and improperly collect, access, steal, or modify
        your information. Although we will do our best to protect your personal
        information, transmission of personal information to and from our
        Services is at your own risk. You should only access the Services
        within a secure environment.
      </p>
    </div>

    <h2
      id="privacyrights"
      className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4"
    >
      7. WHAT ARE YOUR PRIVACY RIGHTS?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        <em>
          <strong className="text-slate-800">In Short:</strong> You may review,
          change, or terminate your account at any time, depending on your
          country, province, or state of residence.
        </em>
      </p>
      <h3
        id="withdrawconsent"
        className="font-jakarta text-xl font-semibold text-slate-900 mt-8 mb-3"
      >
        Withdrawing your consent
      </h3>
      <p className="mb-4">
        <strong className="text-slate-800">
          <u>Withdrawing your consent:</u>
        </strong>{" "}
        If we are relying on your consent to process your personal information,
        which may be express and/or implied consent depending on the applicable
        law, you have the right to withdraw your consent at any time. You can
        withdraw your consent at any time by contacting us by using the contact
        details provided in the section &apos;
        <a
          href="#contact"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
        </a>
        &apos; below.
      </p>
      <p className="mb-4">
        However, please note that this will not affect the lawfulness of the
        processing before its withdrawal nor, when applicable law allows, will
        it affect the processing of your personal information conducted in
        reliance on lawful processing grounds other than consent.
      </p>
      <p className="mb-4">
        <strong className="text-slate-800">
          <u>Opting out of marketing and promotional communications:</u>
        </strong>{" "}
        You can unsubscribe from our marketing and promotional communications
        at any time by clicking on the unsubscribe link in the emails that we
        send, or by contacting us using the details provided in the section
        &apos;
        <a
          href="#contact"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
        </a>
        &apos; below. You will then be removed from the marketing lists.
        However, we may still communicate with you — for example, to send you
        service-related messages that are necessary for the administration and
        use of your account, to respond to service requests, or for other
        non-marketing purposes.
      </p>
      <h3 className="font-jakarta text-xl font-semibold text-slate-900 mt-8 mb-3">
        Account Information
      </h3>
      <p className="mb-4">
        If you would at any time like to review or change the information in
        your account or terminate your account, you can:
      </p>
      <ul className="list-disc pl-5 mb-4 space-y-2">
        <li>
          Log in to your account settings and update your user account.
        </li>
      </ul>
      <p className="mb-4">
        Upon your request to terminate your account, we will deactivate or
        delete your account and information from our active databases. However,
        we may retain some information in our files to prevent fraud,
        troubleshoot problems, assist with any investigations, enforce our
        legal terms and/or comply with applicable legal requirements.
      </p>
      <p className="mb-4">
        <strong className="text-slate-800">
          <u>Cookies and similar technologies:</u>
        </strong>{" "}
        Most Web browsers are set to accept cookies by default. If you prefer,
        you can usually choose to set your browser to remove cookies and to
        reject cookies. If you choose to remove cookies or reject cookies, this
        could affect certain features or services of our Services.
      </p>
      <p className="mb-4">
        If you have questions or comments about your privacy rights, you may
        email us at{" "}
        <a
          href="mailto:support@pocketwise.xyz"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          support@pocketwise.xyz
        </a>
        .
      </p>
    </div>

    <h2
      id="DNT"
      className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4"
    >
      8. CONTROLS FOR DO-NOT-TRACK FEATURES
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        Most web browsers and some mobile operating systems and mobile
        applications include a Do-Not-Track (&apos;DNT&apos;) feature or
        setting you can activate to signal your privacy preference not to have
        data about your online browsing activities monitored and collected. At
        this stage, no uniform technology standard for recognising and
        implementing DNT signals has been finalised. As such, we do not
        currently respond to DNT browser signals or any other mechanism that
        automatically communicates your choice not to be tracked online. If a
        standard for online tracking is adopted that we must follow in the
        future, we will inform you about that practice in a revised version of
        this Privacy Notice.
      </p>
    </div>

    <h2
      id="policyupdates"
      className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4"
    >
      9. DO WE MAKE UPDATES TO THIS NOTICE?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        <em>
          <strong className="text-slate-800">In Short:</strong> Yes, we will
          update this notice as necessary to stay compliant with relevant laws.
        </em>
      </p>
      <p className="mb-4">
        We may update this Privacy Notice from time to time. The updated
        version will be indicated by an updated &apos;Revised&apos; date at the
        top of this Privacy Notice. If we make material changes to this Privacy
        Notice, we may notify you either by prominently posting a notice of
        such changes or by directly sending you a notification. We encourage
        you to review this Privacy Notice frequently to be informed of how we
        are protecting your information.
      </p>
    </div>

    <h2
      id="contact"
      className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4"
    >
      10. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        If you have questions or comments about this notice, you may email us
        at{" "}
        <a
          href="mailto:support@pocketwise.xyz"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          support@pocketwise.xyz
        </a>{" "}
        or contact us by post at:
      </p>
      <p className="mb-4 whitespace-pre-line">
        <strong className="text-slate-800">USEPOCKETWISE LTD</strong>
        {"\n"}
        No 2 Love Road Alabidn Ibadan Oyo State
        {"\n"}
        Ibadan
        {"\n"}
        OYO STATE
        {"\n"}
        Nigeria
      </p>
    </div>

    <h2
      id="request"
      className="font-jakarta text-2xl font-semibold text-slate-900 mt-14 mb-4"
    >
      11. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?
    </h2>
    <div className="text-base text-slate-600 leading-relaxed">
      <p className="mb-4">
        You have the right to request access to the personal information we
        collect from you, details about how we have processed it, correct
        inaccuracies, or delete your personal information. You may also have
        the right to withdraw your consent to our processing of your personal
        information. These rights may be limited in some circumstances by
        applicable law. To request to review, update, or delete your personal
        information, please fill out and submit a{" "}
        <a
          href="https://app.termly.io/dsar/87386610-3219-4d88-a5d5-82cd21aa8c8b"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#4f46e5] hover:text-[#4338ca] underline underline-offset-2"
        >
          data subject access request
        </a>
        .
      </p>
    </div>
  </LegalDocument>
);

export default Page;