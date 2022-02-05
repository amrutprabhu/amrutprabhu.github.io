import { Consent } from './consent'
import Cookies from 'js-cookie'
import Analytics from '../analytics'

export default function ConsentWindow() {
  function renderComponent() {
    if (Cookies.get('cookie-consent') === 'true') {
      return <Analytics />
    } else {
      return <Consent />
    }
  }
  return <>{renderComponent()}</>
}
