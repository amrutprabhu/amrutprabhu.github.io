import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import SectionContainer from './SectionContainer'
import Footer from './Footer'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import Script from 'next/script'
import Image from 'next/image'

const LayoutWrapper = ({ children }) => {
  return (
    <SectionContainer>
      <div className="flex flex-col justify-between h-screen">
        <header className="flex items-center justify-between py-10">
          <div>
            <Link href="/" aria-label="RefactorFirst">
              <div className="flex items-center justify-between">
                <div className="mr-3">
                  <Image
                    src="/static/favicons/icon.png"
                    alt="RefactorFirst"
                    height={50}
                    width={50}
                  />
                </div>
                {typeof siteMetadata.headerTitle === 'string' ? (
                  <div className="h-6 text-2xl font-semibold sm:block">
                    {siteMetadata.headerTitle}
                  </div>
                ) : (
                  siteMetadata.headerTitle
                )}
              </div>
            </Link>
          </div>
          <div className="mt-6">
            <Script
              id="news1"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,e,u,f,l,n){w[f]=w[f]||function(){(w[f].q=w[f].q||[])
                    .push(arguments);},l=d.createElement(e),l.async=1,l.src=u,
                    n=d.getElementsByTagName(e)[0],n.parentNode.insertBefore(l,n);})
                    (window,document,'script','https://assets.mailerlite.com/js/universal.js','ml');
                    ml('account', '531390');
                    `,
              }}
            />
          </div>
          <div className="flex items-center text-base leading-5">
            <div className="hidden sm:block">
              {headerNavLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="p-1 font-medium text-gray-900 sm:p-4 dark:text-gray-100"
                >
                  {link.title == 'Newsletter' ? (
                    <span className="relative pt-1 mr-1">
                      {link.title}
                      <span className="text-xs m-0.5 text-red-400 font-bold leading-none absolute top-0">
                        NEW
                      </span>
                    </span>
                  ) : (
                    link.title
                  )}
                  {/* {link.title} */}
                </Link>
              ))}
            </div>
            <ThemeSwitch />
            <MobileNav />
          </div>
        </header>
        <main className="mb-auto">{children}</main>
        <div className="ml-embedded" data-form="rRtdd0"></div>
        <Footer />
      </div>
    </SectionContainer>
  )
}

export default LayoutWrapper
