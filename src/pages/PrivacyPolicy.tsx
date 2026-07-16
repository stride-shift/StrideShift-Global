import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import SEO from '@/components/SEO';

/* Board-approved Website Privacy Policy (directors' meeting, July 2026).
   Scope is the WEBSITE ONLY — product platforms (Cyborg Habits, Lead Sleuth,
   Tender Render, …) get their own policies in a separate project. Do not
   extend this text to cover products. */

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-display text-2xl text-stride-text-strong mt-10 mb-3 tracking-tight">
    {children}
  </h2>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="leading-relaxed mb-4">{children}</p>
);

const UL = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-6 mb-4 space-y-1.5 leading-relaxed">
    {items.map((it) => (
      <li key={it}>{it}</li>
    ))}
  </ul>
);

const MailLink = () => (
  <a href="mailto:hq@strideshift.ai" className="text-stride-accent underline">
    hq@strideshift.ai
  </a>
);

const PrivacyPolicy = () => {
  return (
    <PageLayout showContact={false}>
      <SEO
        title="Website Privacy Policy · StrideShift"
        description="How StrideShift (a trading name of The Field Institute (Pty) Ltd) collects, uses and protects personal information on this website, under POPIA."
      />
      <section className="pt-28 md:pt-36 pb-16 px-4 sm:px-6 lg:px-8 bg-stride-bg min-h-screen">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-stride-text-muted hover:text-stride-text-strong mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>

          <h1 className="font-display text-4xl md:text-5xl text-stride-text-strong mb-3 tracking-tight">
            StrideShift Website Privacy Policy
          </h1>

          <div className="text-stride-text-muted">
            <p className="text-sm text-stride-text-muted/70 mb-8">
              Effective date: 14 July 2026&ensp;|&ensp;Last updated: 14 July 2026
            </p>

            <H2>1. Who we are</H2>
            <P>
              StrideShift (&ldquo;we&rdquo;, &ldquo;our&rdquo; or &ldquo;us&rdquo;) is a trading
              name of The Field Institute (Pty) Ltd, Registration Number 2017/313210/07, a company
              incorporated in South Africa. For the purposes of the Protection of Personal
              Information Act 4 of 2013 (&ldquo;POPIA&rdquo;), The Field Institute (Pty) Ltd is the
              responsible party for personal information collected through this website.
            </P>
            <P>
              Our Information Officer can be contacted at <MailLink />.
            </P>

            <H2>2. What this policy covers</H2>
            <P>
              This policy explains how we collect, use, share and protect personal information when
              you visit or interact with the StrideShift website. It applies to the website only.
              Where you sign up for, or are given access to, a StrideShift product or platform, the
              use of your information within that product is governed by the terms, licence
              agreement and privacy notice for that product, which will be made available to you
              before or at the time you sign up.
            </P>

            <H2>3. Information we collect</H2>
            <P>
              Information you give us, for example when you complete a contact form or subscribe to
              our newsletter:
            </P>
            <UL
              items={[
                'your name',
                'email address',
                'company name and role',
                'telephone number',
                'the content of messages you send us',
                'newsletter and subscription preferences.',
              ]}
            />
            <P>Information collected automatically when you visit the website:</P>
            <UL
              items={[
                'IP address',
                'browser type and version',
                'device and operating system information',
                'pages visited, time spent on pages and referring website',
                'cookies and similar analytics information.',
              ]}
            />

            <H2>4. How we use your information, and why we are allowed to</H2>
            <P>We use this information to:</P>
            <UL
              items={[
                'respond to your enquiries',
                'contact you about services you have requested',
                'send newsletters and updates where you have subscribed',
                'operate, secure and improve our website',
                'understand how visitors use our website',
                'comply with our legal obligations.',
              ]}
            />
            <P>
              We process personal information on one or more of the following lawful bases under
              POPIA: your consent; the processing being necessary to respond to a request you have
              made or to conclude or perform a contract with you; compliance with a legal
              obligation; or our legitimate interests in operating, securing and improving our
              website, where those interests are not overridden by your rights.
            </P>
            <P>
              We do not sell personal information, and we only collect what we need for the
              purposes described above.
            </P>

            <H2>5. Marketing communications</H2>
            <P>
              We will only send you electronic marketing, such as newsletters, where you have opted
              in, or where you are an existing client and the communication relates to similar
              services, as permitted by section 69 of POPIA. Every marketing message we send will
              include a simple way to unsubscribe, and you may opt out at any time by contacting{' '}
              <MailLink />.
            </P>

            <H2>6. Cookies</H2>
            <P>
              Our website uses cookies and similar technologies to make the site work, to remember
              your preferences and to understand how visitors use the site. You can disable or
              delete cookies through your browser settings, although some website functionality may
              be affected if you do.
            </P>

            <H2>7. Sharing and third-party service providers</H2>
            <P>
              We do not share your personal information with third parties for their own marketing
              purposes. We use carefully selected third-party service providers, such as cloud
              hosting, website hosting, analytics, communications and technology service providers,
              which process information only on our instructions and only to provide services on
              our behalf. These providers act as operators under POPIA and are bound by
              confidentiality and security obligations.
            </P>

            <H2>8. Transfers outside South Africa</H2>
            <P>
              Some of our service providers, such as hosting and analytics platforms, may store or
              process information outside South Africa. Where this happens, we take reasonable
              steps to ensure your information receives a level of protection consistent with
              POPIA, including using providers subject to laws or binding agreements that provide
              comparable protection.
            </P>

            <H2>9. How long we keep your information</H2>
            <P>
              We keep personal information only for as long as it is needed for the purposes
              described in this policy, or as required by law. Enquiry information is retained for
              as long as reasonably necessary to deal with your enquiry and any follow-up.
              Newsletter information is retained until you unsubscribe. Website analytics
              information is retained in line with the retention settings of our analytics
              provider. When information is no longer needed, we delete, destroy or de-identify it.
            </P>

            <H2>10. Security</H2>
            <P>
              We take reasonable and appropriate technical and organisational measures to protect
              personal information collected through this website against loss, unauthorised access
              and unlawful processing. However, no transmission over the internet is completely
              secure and we cannot guarantee absolute security.
            </P>

            <H2>11. Your rights</H2>
            <P>Subject to South African law, you have the right to:</P>
            <UL
              items={[
                'ask whether we hold personal information about you, and request access to it',
                'request that inaccurate or incomplete information be corrected',
                'request that your information be deleted or destroyed where we are no longer entitled to keep it',
                'object to processing, including for direct marketing',
                'withdraw consent where processing is based on consent',
              ]}
            />
            <P>
              You may also lodge a complaint with the Information Regulator (South Africa) at{' '}
              <a
                href="https://www.inforegulator.org.za"
                target="_blank"
                rel="noopener noreferrer"
                className="text-stride-accent underline"
              >
                www.inforegulator.org.za
              </a>
              .
            </P>
            <P>
              To exercise any of these rights, contact us at <MailLink />. We will respond within a
              reasonable time and within any period required by law.
            </P>

            <H2>12. Children</H2>
            <P>
              Our website is not directed at children, and we do not knowingly collect personal
              information from anyone under 18 through this website. If you believe a child has
              provided us with personal information, please contact us and we will delete it.
            </P>

            <H2>13. StrideShift products and platforms</H2>
            <P>
              This Privacy Policy applies only to the StrideShift website. Individual StrideShift
              products and services, including online platforms, learning systems and AI-enabled
              services, may collect additional information necessary to deliver those services.
              Those products and any client platforms this website may link to have their own
              privacy notices, terms of use and data processing terms, which apply in addition to
              this policy when you use them. This Website Privacy Policy does not govern the
              processing of client data within our products or engagements, which is dealt with in
              our contracts with clients.
            </P>

            <H2>14. Changes to this policy</H2>
            <P>
              We may update this Privacy Policy from time to time. The latest version of this
              Privacy Policy will always be available on this website. If we make material changes,
              we will indicate this on the website.
            </P>

            <H2>15. Contact us</H2>
            <P>
              Questions, requests or complaints about this policy or your personal information can
              be sent to:
            </P>
            <address className="not-italic leading-relaxed mb-4">
              The Field Institute (Pty) Ltd, trading as StrideShift
              <br />
              Registration No. 2017/313210/07
              <br />
              7 Escombe Avenue
              <br />
              Parktown West
              <br />
              Johannesburg
              <br />
              South Africa
              <br />
              Email: <MailLink />
            </address>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default PrivacyPolicy;
