import Consent from './consent'
import Cookies from 'js-cookie'
import Analytics from '../analytics'

export default function ConsentWindowDecision() {
  function renderComponent() {
    // debugger
    if (Cookies.get('cookie-notice-dismissed') === 'true') {
      return <Analytics />
    } else {
      return <Consent />
    }
  }
  return <>{renderComponent()}</>
}
