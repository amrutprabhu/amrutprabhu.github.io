import Cookies from 'js-cookie'
import Link from '../Link'
import Router from 'next/router'
import SectionContainer from '../SectionContainer'
import classes from './consent.module.css'

export function Consent() {
  function acceptCookies() {
    Cookies.set('cookie-consent', true)
    Router.reload(window.location.pathname)
  }
  return (
    <SectionContainer>
      <div className={classes.consentname}>
        <br />
        <br />
        <p>
          By clicking “I Accept”, you agree to the storing of cookies on your device to enhance site
          navigation and analyze site usage
        </p>
        <br />
        <br />
        <div>
          <Link className={classes.greenButton} onClick={acceptCookies}>
            Accept
          </Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
        <br />
        <br />
        <br />
      </div>
    </SectionContainer>
  )
}
