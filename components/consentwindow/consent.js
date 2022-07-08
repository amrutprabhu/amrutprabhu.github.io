import Cookies from 'js-cookie'
import Link from '../Link'
import Script from 'next/script'
import Router from 'next/router'
import SectionContainer from '../SectionContainer'
import classes from './consent.module.css'
import siteMetadata from '@/data/siteMetadata'

export default function Consent() {
  // Not Used
  function acceptCookies() {
    Cookies.set('cookie-consent', true)
    Router.reload(window.location.pathname)
  }
  return (
    <SectionContainer>
      <div id="cookie-notice" className={classes.consentname}>
        <br />
        <br />
        <p>
          By clicking “I Accept”, you agree to the storing of cookies on your device to enhance site
          navigation and analyze site usage
        </p>
        <br />
        <br />
        <div>
          <a id="cookie-notice-accept" className={classes.greenButton}>
            I Accept
          </a>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
        <br />
        <br />
        <br />
        <Script
          id="consent"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            
          function createCookie(name,value,days) {
              var expires = "";
              if (days) {
                  var date = new Date();
                  date.setTime(date.getTime() + (days*24*60*60*1000));
                  expires = "; expires=" + date.toUTCString();
              }
              document.cookie = name + "=" + value + expires + "; path=/";
          }
          function readCookie(name) {
              var nameEQ = name + "=";
              var ca = document.cookie.split(';');
              for(var i=0;i < ca.length;i++) {
                  var c = ca[i];
                  while (c.charAt(0)==' ') c = c.substring(1,c.length);
                  if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
              }
              return null;
          }

          // function addAnalytics(){
          //   (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          //     (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          //     m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          //     })(window,document,'script','//www.googletagmanager.com/gtag/js?id=${siteMetadata.analytics.googleAnalyticsId}','ga');
            
          //     window.dataLayer = window.dataLayer || [];
          //     function ga(){dataLayer.push(arguments);}
          //     ga('js', new Date());
          //     ga('config', '${siteMetadata.analytics.googleAnalyticsId}', { 'anonymize_ip': true, 'allowAdFeatures': false });
          // }

          if(readCookie('cookie-notice-dismissed')=='true') {
            // addAnalytics()
            document.getElementById('cookie-notice').style.display = 'none'
          } else {
              document.getElementById('cookie-notice').style.display = 'block';
          }
          document.getElementById('cookie-notice-accept').addEventListener("click",function() {
              createCookie('cookie-notice-dismissed','true',31);
              document.getElementById('cookie-notice').style.display = 'none';
              location.reload();
          });
          `,
          }}
        />
      </div>
    </SectionContainer>
  )
}
